import { FaFacebookF, FaTwitter, FaInstagram } from 'react-icons/fa';

// Team member data
const teamMembers = [
  {
    id: 1,
    name: "Queen Doe",
    designation: "Founder & CEO",
    image: "/img/team-1.jpg",
    delay: "0.1s",
    social: {
      facebook: "#",
      twitter: "#",
      instagram: "#"
    }
  },
  {
    id: 2,
    name: "Raj Smith",
    designation: "Project Manager",
    image: "/img/team-2.jpg",
    delay: "0.3s",
    social: {
      facebook: "#",
      twitter: "#",
      instagram: "#"
    }
  },
  {
    id: 3,
    name: "Ashish Jack",
    designation: "Development Lead",
    image: "/img/team-3.jpg",
    delay: "0.5s",
    social: {
      facebook: "#",
      twitter: "#",
      instagram: "#"
    }
  },
  {
    id: 4,
    name: "Sarah Williams",
    designation: "Marketing Director",
    image: "/img/team-4.jpg",
    delay: "0.7s",
    social: {
      facebook: "#",
      twitter: "#",
      instagram: "#"
    }
  }
];

export default function TeamSection() {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mx-auto mb-12 wow fadeInUp" data-wow-delay="0.1s" style={{ maxWidth: "500px" }}>
          <div className="d-inline-block rounded-pill bg-orange-100 text-orange-500 py-1 px-3 mb-3 inline-block">
            Team Members
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-5">Let's Meet With Our Ordinary Soldiers</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {teamMembers.map((member) => (
            <div key={member.id} className="wow fadeInUp" data-wow-delay={member.delay}>
              <div className="team-item relative rounded-lg overflow-hidden shadow-md group">
                <div className="overflow-hidden">
                  <img 
                    className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110" 
                    src={member.image} 
                    alt={member.name}
                    onError={(e) => {
                      e.currentTarget.src = "https://placehold.co/400x500/orange/white?text=Team+Member";
                    }}
                  />
                </div>
                <div className="team-text bg-white text-center p-4">
                  <h5 className="text-lg font-semibold">{member.name}</h5>
                  <p className="text-orange-500">{member.designation}</p>
                  <div className="team-social text-center mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="flex justify-center gap-2">
                      <a 
                        className="btn-square bg-orange-500 hover:bg-orange-600 text-white w-8 h-8 flex items-center justify-center rounded" 
                        href={member.social.facebook}
                      >
                        <FaFacebookF />
                      </a>
                      <a 
                        className="btn-square bg-orange-500 hover:bg-orange-600 text-white w-8 h-8 flex items-center justify-center rounded" 
                        href={member.social.twitter}
                      >
                        <FaTwitter />
                      </a>
                      <a 
                        className="btn-square bg-orange-500 hover:bg-orange-600 text-white w-8 h-8 flex items-center justify-center rounded" 
                        href={member.social.instagram}
                      >
                        <FaInstagram />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add CSS for animations */}
      <style jsx="true" global="true">{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translate3d(0, 30px, 0);
          }
          to {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
        }
        
        .wow.fadeInUp {
          animation: fadeInUp 1s;
        }
        
        .rounded-pill {
          border-radius: 50rem;
        }
      `}</style>
    </section>
  );
}
