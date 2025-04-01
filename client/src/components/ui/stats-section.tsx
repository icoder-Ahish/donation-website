export default function StatsSection() {
  const stats = [
    { value: "120+", label: "Campaigns Funded" },
    { value: "$2.5M", label: "Donations Collected" },
    { value: "15K", label: "Lives Impacted" },
    { value: "30", label: "Countries Reached" }
  ];

  return (
    <section className="py-16 bg-slate-50 mb-16">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Our Impact</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">{stat.value}</div>
              <h3 className="text-lg font-semibold">{stat.label}</h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
