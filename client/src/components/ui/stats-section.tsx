export default function StatsSection() {
  const stats = [
    { value: "120+", label: "Campaigns Funded", icon: "bi-flag" },
    { value: "$2.5M", label: "Donations Collected", icon: "bi-cash-stack" },
    { value: "15K", label: "Lives Impacted", icon: "bi-people" },
    { value: "30", label: "Countries Reached", icon: "bi-globe" }
  ];

  return (
    <section className="py-16 bg-gradient-to-r from-orange-50 to-orange-100 mb-16 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-32 h-32 bg-orange-200 rounded-full opacity-30 -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-48 h-48 bg-orange-300 rounded-full opacity-20 translate-x-1/3 translate-y-1/3"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1 bg-orange-200 text-orange-700 rounded-full text-sm font-medium mb-3">
            Our Impact
          </span>
          <h2 className="text-3xl font-bold text-slate-800 mb-4">Making A Difference Together</h2>
          <div className="w-20 h-1 bg-orange-500 mx-auto"></div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-md border border-orange-100 hover:border-orange-300 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-orange-100 text-orange-600">
                <i className={`bi ${stat.icon} text-3xl`}></i>
              </div>
              <div className="text-4xl md:text-5xl font-bold text-orange-600 mb-2">{stat.value}</div>
              <h3 className="text-lg font-semibold text-slate-700">{stat.label}</h3>
            </div>
          ))}
        </div>
        
        {/* Optional: Add a brief description */}
        <p className="text-center mt-10 text-slate-600 max-w-2xl mx-auto">
          Through the generosity of our donors, we've been able to create lasting change in communities around the world. Every donation, no matter the size, contributes to our mission.
        </p>
      </div>
    </section>
  );
}
