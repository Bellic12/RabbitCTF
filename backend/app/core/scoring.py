from abc import ABC, abstractmethod


# 1. La Interfaz (IScoringStrategy)
class IScoringStrategy(ABC):
    @abstractmethod
    def calculate_score(
        self, base_score: int, solve_count: int, decay: float = 0, min_score: int = 0
    ) -> int:
        pass


# 2. Implementación Estática (StaticScoringStrategy)
class StaticScoringStrategy(IScoringStrategy):
    def calculate_score(
        self, base_score: int, solve_count: int, decay: float = 0, min_score: int = 0
    ) -> int:
        return base_score


# 3. Implementación Dinámica (DynamicScoringStrategy)
class DynamicScoringStrategy(IScoringStrategy):
    def calculate_score(
        self, base_score: int, solve_count: int, decay: float = 0, min_score: int = 0
    ) -> int:
        # Ejemplo simple de fórmula de decaimiento
        if solve_count <= 0:
            return base_score
        value = base_score * (decay**solve_count)
        return max(int(value), min_score)


# 4. Fábrica para elegir la estrategia
def get_scoring_strategy(strategy_name: str) -> IScoringStrategy:
    strategies = {
        "static": StaticScoringStrategy(),
        "dynamic": DynamicScoringStrategy(),
    }
    return strategies.get(strategy_name, StaticScoringStrategy())
