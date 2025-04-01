export default function HowItWorks() {
  const steps = [
    {
      icon: "bi-search",
      title: "1. Find a Campaign",
      description: "Browse through our campaigns and find a cause that resonates with you."
    },
    {
      icon: "bi-credit-card",
      title: "2. Make a Donation",
      description: "Contribute any amount through our secure payment system with just a few clicks."
    },
    {
      icon: "bi-graph-up-arrow",
      title: "3. Track Impact",
      description: "Receive updates on how your donation is being utilized and the difference it's making."
    }
  ];

  return (
    <section className="py-16 container mx-auto px-4 mb-16" id="how-it-works">
      <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
      <div className="grid md:grid-cols-3 gap-8">
        {steps.map((step, index) => (
          <div key={index} className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-primary bg-opacity-10">
              <i className={`bi ${step.icon} text-3xl text-primary`}></i>
            </div>
            <h3 className="text-xl font-bold mb-3">{step.title}</h3>
            <p className="text-slate-600">{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
