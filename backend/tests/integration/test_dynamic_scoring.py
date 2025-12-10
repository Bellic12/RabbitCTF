"""
Simple integration test for dynamic scoring recalculation.

This test uses the actual PostgreSQL database from Docker to test
the dynamic scoring functionality in a real environment.
"""

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

from datetime import datetime, timezone
from app.core.database import SessionLocal, get_db
from app.models.user import User
from app.models.role import Role
from app.models.team import Team
from app.models.team_member import TeamMember
from app.models.challenge import Challenge
from app.models.challenge_category import ChallengeCategory
from app.models.difficulty import Difficulty
from app.models.challenge_flag import ChallengeFlag
from app.models.challenge_score_config import ChallengeScoreConfig
from app.models.submission import Submission
from app.models.user_credential import UserCredential
from app.services.challenge_service import ChallengeService
from app.services.submission_service import SubmissionService
from app.core.security import get_password_hash


def cleanup_test_data(db):
    """Clean up test data from database."""
    print(" Cleaning up test data...")
    
    # Delete in reverse order of dependencies
    db.query(Submission).filter(Submission.challenge_id.in_(
        db.query(Challenge.id).filter(Challenge.title.like("TEST_%"))
    )).delete(synchronize_session=False)
    
    db.query(ChallengeScoreConfig).filter(ChallengeScoreConfig.challenge_id.in_(
        db.query(Challenge.id).filter(Challenge.title.like("TEST_%"))
    )).delete(synchronize_session=False)
    
    db.query(ChallengeFlag).filter(ChallengeFlag.challenge_id.in_(
        db.query(Challenge.id).filter(Challenge.title.like("TEST_%"))
    )).delete(synchronize_session=False)
    
    db.query(Challenge).filter(Challenge.title.like("TEST_%")).delete(synchronize_session=False)
    
    db.query(TeamMember).filter(TeamMember.team_id.in_(
        db.query(Team.id).filter(Team.name.like("TEST_%"))
    )).delete(synchronize_session=False)
    
    db.query(Team).filter(Team.name.like("TEST_%")).delete(synchronize_session=False)
    
    # Delete user credentials before users (FK constraint)
    db.query(UserCredential).filter(UserCredential.user_id.in_(
        db.query(User.id).filter(User.username.like("test_%"))
    )).delete(synchronize_session=False)
    
    db.query(User).filter(User.username.like("test_%")).delete(synchronize_session=False)
    
    db.commit()
    print(" Cleanup completed")


def test_dynamic_scoring_integration():
    """
    Integration test for dynamic scoring recalculation.
    
    Tests that when multiple teams solve a dynamic challenge,
    the scores are recalculated correctly for all previous submissions.
    """
    print("\n" + "="*50)
    print(" DYNAMIC SCORING INTEGRATION TEST")
    print("="*50)
    
    db = SessionLocal()
    
    try:
        # Cleanup any previous test data
        cleanup_test_data(db)
        
        # ============================================
        # SETUP: Create test data
        # ============================================
        print("\n Setting up test data...")
        
        # Get existing category and difficulty
        category = db.query(ChallengeCategory).first()
        difficulty = db.query(Difficulty).first()
        user_role = db.query(Role).filter(Role.name == "user").first()
        
        if not category or not difficulty or not user_role:
            print(" ERROR: Missing required data (category, difficulty, or role)")
            return False
        
        # Create test users FIRST (needed for captain_id)
        user_alice = User(username="test_alice", email="test_alice@test.com", role_id=user_role.id)
        user_bob = User(username="test_bob", email="test_bob@test.com", role_id=user_role.id)
        user_charlie = User(username="test_charlie", email="test_charlie@test.com", role_id=user_role.id)
        
        db.add_all([user_alice, user_bob, user_charlie])
        db.flush()  # Get user IDs
        
        # Create user credentials
        password_hash = get_password_hash("password123")
        db.add(UserCredential(user_id=user_alice.id, password_hash=password_hash))
        db.add(UserCredential(user_id=user_bob.id, password_hash=password_hash))
        db.add(UserCredential(user_id=user_charlie.id, password_hash=password_hash))
        
        # Create test teams with captains
        team_alpha = Team(name="TEST_Team_Alpha", captain_id=user_alice.id, total_score=0)
        team_beta = Team(name="TEST_Team_Beta", captain_id=user_bob.id, total_score=0)
        team_gamma = Team(name="TEST_Team_Gamma", captain_id=user_charlie.id, total_score=0)
        db.add_all([team_alpha, team_beta, team_gamma])
        db.flush()
        
        # Assign users to teams as members
        db.add(TeamMember(team_id=team_alpha.id, user_id=user_alice.id))
        db.add(TeamMember(team_id=team_beta.id, user_id=user_bob.id))
        db.add(TeamMember(team_id=team_gamma.id, user_id=user_charlie.id))
        
        # Create dynamic scoring challenge
        challenge = Challenge(
            title="TEST_Dynamic_Challenge",
            description="Test challenge for dynamic scoring",
            category_id=category.id,
            difficulty_id=difficulty.id,
            created_by=user_alice.id,
            is_draft=False,
        )
        db.add(challenge)
        db.flush()
        
        # Create flag
        flag = ChallengeFlag(
            challenge_id=challenge.id,
            flag_value="RabbitCTF{test_dynamic_flag}"
        )
        db.add(flag)
        
        # Create dynamic score config
        score_config = ChallengeScoreConfig(
            challenge_id=challenge.id,
            scoring_mode="DYNAMIC",
            base_score=500,
            decay_factor=0.9,
            min_score=50
        )
        db.add(score_config)
        
        db.commit()
        print(" Test data created")
        
        # ============================================
        # TEST: Submit flags and verify recalculation
        # ============================================
        service = SubmissionService(db)
        
        print("\n Test Scenario:")
        print("  - Challenge: base_score=500, decay=0.9, mode=DYNAMIC")
        print("  - Expected scores:")
        print("    • Team Alpha (1st): 500 * (0.9^0) = 500")
        print("    • Team Beta  (2nd): 500 * (0.9^1) = 450")
        print("    • Team Gamma (3rd): 500 * (0.9^2) = 405")
        
        # ==================
        # Submission 1: Team Alpha
        # ==================
        print("\n Submission 1: Team Alpha submits flag...")
        result_a = service.submit_flag(
            challenge_id=challenge.id,
            flag_value="RabbitCTF{test_dynamic_flag}",
            user=user_alice
        )
        
        db.refresh(team_alpha)
        
        print(f"   Result: {'CORRECT' if result_a.is_correct else 'WRONG'}")
        print(f"   Score awarded: {result_a.score_awarded}")
        print(f"   Team Alpha total: {team_alpha.total_score}")
        
        assert result_a.is_correct, "Submission should be correct"
        assert team_alpha.total_score == 500, f"Team Alpha should have 500, got {team_alpha.total_score}"
        
        # ==================
        # Submission 2: Team Beta
        # ==================
        print("\n Submission 2: Team Beta submits flag...")
        result_b = service.submit_flag(
            challenge_id=challenge.id,
            flag_value="RabbitCTF{test_dynamic_flag}",
            user=user_bob
        )
        
        db.refresh(team_alpha)
        db.refresh(team_beta)
        
        print(f"   Result: {'CORRECT' if result_b.is_correct else 'WRONG'}")
        print(f"   Score awarded: {result_b.score_awarded}")
        print(f"   Team Alpha total: {team_alpha.total_score} (should stay 500)")
        print(f"   Team Beta total: {team_beta.total_score} (should be 450)")
        
        assert team_alpha.total_score == 500, f"Team Alpha should have 500, got {team_alpha.total_score}"
        assert team_beta.total_score == 450, f"Team Beta should have 450, got {team_beta.total_score}"
        
        # ==================
        # Submission 3: Team Gamma
        # ==================
        print("\n Submission 3: Team Gamma submits flag...")
        result_c = service.submit_flag(
            challenge_id=challenge.id,
            flag_value="RabbitCTF{test_dynamic_flag}",
            user=user_charlie
        )
        
        db.refresh(team_alpha)
        db.refresh(team_beta)
        db.refresh(team_gamma)
        
        print(f"   Result: {'CORRECT' if result_c.is_correct else 'WRONG'}")
        print(f"   Score awarded: {result_c.score_awarded}")
        print(f"   Team Alpha total: {team_alpha.total_score} (should stay 500)")
        print(f"   Team Beta total: {team_beta.total_score} (should stay 450)")
        print(f"   Team Gamma total: {team_gamma.total_score} (should be 405)")
        
        assert team_alpha.total_score == 500, f"Team Alpha should have 500, got {team_alpha.total_score}"
        assert team_beta.total_score == 450, f"Team Beta should have 450, got {team_beta.total_score}"
        assert team_gamma.total_score == 405, f"Team Gamma should have 405, got {team_gamma.total_score}"
        
        # ==================
        # Verify submission scores in DB
        # ==================
        print("\n Verifying awarded_score in database...")
        submissions = (
            db.query(Submission)
            .filter(Submission.challenge_id == challenge.id, Submission.is_correct.is_(True))
            .order_by(Submission.submitted_at.asc())
            .all()
        )
        
        print(f"   Total submissions: {len(submissions)}")
        for i, sub in enumerate(submissions):
            print(f"   Submission {i+1}: awarded_score = {sub.awarded_score}")
        
        assert len(submissions) == 3, "Should have 3 submissions"
        assert submissions[0].awarded_score == 500, f"1st submission should be 500, got {submissions[0].awarded_score}"
        assert submissions[1].awarded_score == 450, f"2nd submission should be 450, got {submissions[1].awarded_score}"
        assert submissions[2].awarded_score == 405, f"3rd submission should be 405, got {submissions[2].awarded_score}"
        
        print("\n" + "="*50)
        print(" ALL TESTS PASSED!")
        print("="*50)
        
        return True
        
    except AssertionError as e:
        print(f"\n TEST FAILED: {e}")
        return False
    except Exception as e:
        print(f"\n ERROR: {e}")
        import traceback
        traceback.print_exc()
        return False
    finally:
        # Cleanup
        cleanup_test_data(db)
        db.close()


if __name__ == "__main__":
    success = test_dynamic_scoring_integration()
    sys.exit(0 if success else 1)
