export default function ActivityLog() {
  const activities = [
    { id: 1, type: 'solve', title: 'Challenge solved', desc: "CyberNinjas solved 'SQL Injection Basics'", time: '2 min ago', color: 'text-success' },
    { id: 2, type: 'fail', title: 'Failed attempt', desc: "HackMasters failed 'Buffer Overflow' (3rd attempt)", time: '5 min ago', color: 'text-error' },
    { id: 3, type: 'register', title: 'User registered', desc: "New user 'eve_ctf' joined team ByteBusters", time: '8 min ago', color: 'text-info' },
    { id: 4, type: 'publish', title: 'Challenge published', desc: "Admin published 'XSS Advanced Techniques'", time: '12 min ago', color: 'text-warning' },
    { id: 5, type: 'solve', title: 'Challenge solved', desc: "ByteBusters solved 'SQL Injection Basics'", time: '18 min ago', color: 'text-success' },
  ]

  return (
    <div>
      <h3 className="text-lg font-bold mb-6">Recent Activity</h3>
      <div className="space-y-4">
        {activities.map(activity => (
          <div key={activity.id} className="flex items-start gap-4 p-4 rounded-lg bg-base-200 border border-white/5">
            <div className={`mt-1 ${activity.color}`}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <h4 className="font-bold text-sm">{activity.title}</h4>
                <span className="text-xs text-white/40">{activity.time}</span>
              </div>
              <p className="text-sm text-white/60">{activity.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
