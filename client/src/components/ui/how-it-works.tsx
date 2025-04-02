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
    <section className="py-16 bg-orange-50 container mx-auto px-4 mb-16 rounded-lg" id="how-it-works">
      <div className="text-center mb-12">
        <span className="inline-block px-4 py-1 bg-orange-100 text-orange-600 rounded-full text-sm font-medium mb-3">
          Simple Process
        </span>
        <h2 className="text-3xl font-bold text-slate-800 mb-4">How It Works</h2>
        <div className="w-20 h-1 bg-orange-500 mx-auto"></div>
      </div>
      
      <div className="grid md:grid-cols-3 gap-8 relative">
        {/* Connecting line between steps */}
        <div className="hidden md:block absolute top-24 left-0 right-0 h-0.5 bg-gradient-to-r from-orange-200 via-orange-400 to-orange-200 z-0"></div>
        
        {steps.map((step, index) => (
          <div key={index} className="relative z-10">
            <div className="bg-white rounded-lg p-8 shadow-lg border border-orange-100 hover:border-orange-300 transition-all duration-300 hover:shadow-orange-100 h-full flex flex-col items-center text-center group">
              <div className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-orange-500 text-white group-hover:bg-orange-600 transition-colors duration-300 shadow-md">
                <i className={`bi ${step.icon} text-3xl`}></i>
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-800 group-hover:text-orange-600 transition-colors duration-300">{step.title}</h3>
              <p className="text-slate-600">{step.description}</p>
              
              {/* Add number indicator */}
              <div className="absolute -top-3 -right-3 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold shadow-md">
                {index + 1}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Add a CTA button */}
      <div className="text-center mt-12">
        <a href="/campaigns" className="inline-flex items-center justify-center px-6 py-3 bg-orange-500 text-white rounded-full font-medium hover:bg-orange-600 transition-colors duration-300 shadow-md hover:shadow-lg">
          Start Donating Now
          <i className="bi bi-arrow-right ml-2"></i>
        </a>
      </div>
    </section>
  );
}
