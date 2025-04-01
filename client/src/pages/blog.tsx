import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "wouter";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog";

// Sample blog posts data
const blogPosts = [
  {
    id: 1,
    title: "The Impact of Small Donations on Global Water Crisis",
    excerpt: "Discover how even small contributions can make a significant difference in providing clean water to communities in need.",
    content: `<p>Access to clean water is a fundamental human right, yet millions of people around the world still lack this basic necessity. The global water crisis affects over 2 billion people, with devastating consequences for health, education, and economic development.</p>
    
    <p>While the scale of this problem may seem overwhelming, small donations can create ripple effects that lead to significant change. Here's how your contribution, no matter the size, helps address the global water crisis:</p>
    
    <h3>Direct Impact of Small Donations</h3>
    <p>Even a donation as small as $25 can provide clean water to a person for years. When these small donations are pooled together, they fund comprehensive water projects that transform entire communities. These projects include drilling wells, installing filtration systems, and building infrastructure for water collection and storage.</p>
    
    <h3>Community Empowerment</h3>
    <p>Beyond providing immediate access to clean water, these projects empower communities to maintain their water systems independently. Local residents receive training in system maintenance and water management, ensuring the sustainability of these initiatives long after the initial installation.</p>
    
    <h3>Ripple Effects</h3>
    <p>The benefits of clean water extend far beyond hydration. When communities gain access to clean water:</p>
    <ul>
      <li>Health improves as waterborne diseases decrease</li>
      <li>Children (especially girls) can attend school instead of walking hours to collect water</li>
      <li>Women gain time for education and income-generating activities</li>
      <li>Agricultural productivity increases</li>
      <li>Local economies strengthen</li>
    </ul>
    
    <p>Your donation, combined with others, creates a powerful force for change. Together, we can make clean water accessible to all.</p>`,
    imageUrl: "https://images.unsplash.com/photo-1519750783826-e2420f4d687f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
    date: "March 15, 2023",
    author: "Sarah Johnson",
    category: "Impact Stories"
  },
  {
    id: 2,
    title: "Education Transforms Lives: Success Stories from Our Scholarship Program",
    excerpt: "Read inspiring stories of students whose lives were changed through educational opportunities provided by your generous donations.",
    content: `<p>Education is one of the most powerful tools for breaking the cycle of poverty and creating lasting change. Through our scholarship program, funded entirely by generous donors like you, we've been able to provide educational opportunities to students who would otherwise be unable to continue their studies.</p>
    
    <p>Here are just a few of the inspiring success stories from our scholarship recipients:</p>
    
    <h3>Maria's Journey to Medical School</h3>
    <p>Growing up in a rural village, Maria dreamed of becoming a doctor to serve her community where medical care was scarce. Despite being the top student in her school, her family couldn't afford to send her to university. Through our scholarship program, Maria was able to complete her undergraduate studies and has now been accepted to medical school. "This scholarship didn't just change my life," she says. "It will change the lives of everyone in my community when I return as a doctor."</p>
    
    <h3>James's Engineering Success</h3>
    <p>James lost both parents at a young age and was raised by his grandmother in an urban slum. Despite these challenges, he excelled in mathematics and science. Our scholarship enabled him to pursue engineering studies, and he now works for a renewable energy company, developing sustainable solutions for communities like his own. "Education gave me the tools to solve problems I've experienced firsthand," James explains.</p>
    
    <h3>Priya's Return to the Classroom</h3>
    <p>After receiving her teaching degree through our scholarship program, Priya returned to her hometown to teach at the local school. She's now inspiring a new generation of students and advocating for girls' education in her community. "When girls see me, a woman from their own village, working as a teacher, they begin to imagine new possibilities for themselves," Priya says.</p>
    
    <p>These stories represent just a fraction of the lives transformed through educational opportunities. Your donations make these transformations possible, creating ripple effects that extend far beyond individual students to their families, communities, and future generations.</p>`,
    imageUrl: "https://images.unsplash.com/photo-1509062522246-3755977927d7?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
    date: "February 28, 2023",
    author: "Michael Rodriguez",
    category: "Success Stories"
  },
  {
    id: 3,
    title: "Healthcare for All: Building Clinics in Underserved Areas",
    excerpt: "Learn about our efforts to establish healthcare facilities in communities with limited access to medical services.",
    content: `<p>Access to healthcare is a fundamental right, yet millions of people worldwide lack basic medical services. Our Healthcare for All initiative focuses on establishing clinics in regions where medical care is scarce or nonexistent, bringing essential services to those who need them most.</p>
    
    <h3>Addressing Critical Gaps</h3>
    <p>In many remote and underserved communities, the nearest hospital might be hours or even days away. This distance creates insurmountable barriers, especially for preventive care and medical emergencies. Our community clinics bridge this gap, providing:</p>
    <ul>
      <li>Primary healthcare services</li>
      <li>Maternal and child health services</li>
      <li>Vaccinations and preventive care</li>
      <li>Basic emergency services</li>
      <li>Health education and outreach</li>
    </ul>
    
    <h3>Recent Achievements</h3>
    <p>Over the past year, we've established three new clinics in remote regions, serving over 15,000 people who previously had no access to healthcare. These facilities have already:</p>
    <ul>
      <li>Delivered over 200 healthy babies</li>
      <li>Vaccinated more than 3,000 children</li>
      <li>Treated countless cases of preventable diseases</li>
      <li>Trained 45 local community health workers</li>
    </ul>
    
    <h3>Sustainable Healthcare Model</h3>
    <p>Our approach goes beyond simply building clinics. We work with local communities to create sustainable healthcare systems by:</p>
    <ul>
      <li>Training local residents as healthcare workers</li>
      <li>Establishing supply chains for medications and equipment</li>
      <li>Developing telehealth capabilities to connect with specialists</li>
      <li>Creating community health committees for local governance</li>
    </ul>
    
    <p>Through these efforts, we're not just providing immediate care but building healthcare infrastructure that will serve communities for generations to come. Your support makes this vital work possible.</p>`,
    imageUrl: "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
    date: "January 20, 2023",
    author: "Dr. Emily Chen",
    category: "Healthcare Initiatives"
  },
  {
    id: 4,
    title: "Sustainable Giving: How Monthly Donations Create Lasting Change",
    excerpt: "Explore the benefits of recurring donations and how they help organizations plan and implement long-term solutions.",
    content: `<p>While one-time donations provide valuable support for immediate needs, monthly recurring donations offer unique advantages that create the foundation for lasting change. As we work to address complex social and environmental challenges, the predictable revenue from monthly donors enables more effective planning and implementation of long-term solutions.</p>
    
    <h3>The Power of Predictable Funding</h3>
    <p>For nonprofit organizations, knowing how much funding will be available in the coming months makes all the difference in planning effective programs. Monthly donations provide:</p>
    <ul>
      <li>Stability to maintain ongoing programs without interruption</li>
      <li>Ability to plan and implement multi-year initiatives</li>
      <li>Reduced fundraising costs, allowing more resources to go directly to programs</li>
      <li>Capacity to respond quickly to emergencies without diverting funds from existing projects</li>
    </ul>
    
    <h3>Impact Over Time</h3>
    <p>Many of the most effective solutions require sustained effort over time. For example:</p>
    <ul>
      <li>Educational programs need to support students through multiple years of schooling</li>
      <li>Environmental restoration projects require ongoing maintenance and monitoring</li>
      <li>Community development initiatives build capacity gradually through consistent support</li>
    </ul>
    
    <h3>The Ripple Effect of Monthly Giving</h3>
    <p>Even small monthly donations create significant impact when sustained over time. A monthly gift of $25 provides $300 in a year—enough to fund substantial change in many contexts. When combined with other monthly donations, these contributions create a reliable foundation for transformative work.</p>
    
    <h3>Getting Started with Monthly Giving</h3>
    <p>Becoming a monthly donor is simple and can be adjusted at any time. Most donors find that setting up a small monthly contribution fits easily into their budget while creating meaningful impact for causes they care about.</p>
    
    <p>By joining our community of monthly donors, you become a vital partner in creating sustainable solutions to the challenges we collectively face.</p>`,
    imageUrl: "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
    date: "December 10, 2022",
    author: "David Wilson",
    category: "Donation Strategies"
  },
  {
    id: 5,
    title: "Corporate Partnerships: Businesses Making a Difference",
    excerpt: "Discover how corporate social responsibility initiatives are helping fund essential community development projects.",
    content: `<p>Corporate social responsibility (CSR) has evolved from a nice-to-have initiative to an essential component of business strategy. Today's most forward-thinking companies recognize that their success is intertwined with the wellbeing of communities and the environment. Through strategic partnerships, businesses are making significant contributions to addressing social and environmental challenges while also strengthening their brands and engaging their employees.</p>
    
    <h3>Innovative Partnership Models</h3>
    <p>Our corporate partnerships go beyond traditional philanthropy to create shared value for communities, companies, and causes. Some of our most successful partnership models include:</p>
    
    <h4>Skills-Based Volunteering</h4>
    <p>Companies like Tech Solutions International have provided over 2,000 hours of technical expertise to help develop digital platforms for education and healthcare delivery in remote areas. This contribution, valued at over $300,000, has dramatically extended our reach while providing meaningful professional development for their employees.</p>
    
    <h4>Product-Based Giving</h4>
    <p>Through our partnership with CleanWater Co., every purchase of their filtration products funds clean water access for communities in need. This model has provided clean water to over 50,000 people while boosting sales and brand loyalty for the company.</p>
    
    <h4>Matched Giving Programs</h4>
    <p>Global Financial Group has implemented a 2:1 matching program for employee donations, tripling the impact of individual contributions while fostering a culture of giving within their organization. Last year, this program generated over $1.2 million for community development projects.</p>
    
    <h3>Measuring Impact</h3>
    <p>Transparency and accountability are central to our corporate partnerships. We work with each partner to establish clear metrics for measuring social and environmental impact, providing regular reports that companies can share with stakeholders. This data-driven approach ensures that resources are used effectively and that companies can clearly communicate the outcomes of their investments.</p>
    
    <p>Through these innovative partnerships, businesses are demonstrating that profit and purpose can go hand in hand, creating sustainable models for corporate engagement in addressing global challenges.</p>`,
    imageUrl: "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
    date: "November 5, 2022",
    author: "Jennifer Garcia",
    category: "Partnerships"
  },
  {
    id: 6,
    title: "Volunteer Spotlight: Meet the People Behind the Scenes",
    excerpt: "Get to know the dedicated volunteers who contribute their time and skills to make our campaigns successful.",
    content: `<p>Behind every successful campaign and initiative are dedicated volunteers who generously contribute their time, skills, and passion. These individuals come from diverse backgrounds but share a common commitment to creating positive change. In this spotlight, we introduce you to some of the remarkable people whose behind-the-scenes efforts make our work possible.</p>
    
    <h3>Maria Gonzalez: Community Organizer</h3>
    <p>A retired teacher with 30 years of experience, Maria now coordinates our education programs in urban communities. She recruits and trains volunteer tutors, develops curriculum materials, and builds relationships with local schools. "After teaching for so many years, I couldn't just stop caring about education," Maria explains. "Volunteering lets me continue making a difference while mentoring a new generation of educators."</p>
    
    <h3>James Chen: Technical Support Specialist</h3>
    <p>As a software engineer by day, James dedicates his weekends to maintaining our digital infrastructure and training staff on new technologies. His expertise has helped us streamline operations and reach more people through digital platforms. "Technology can be a powerful tool for social change when it's accessible to everyone," James says. "I'm proud to help bridge the digital divide through my volunteer work."</p>
    
    <h3>Aisha Okafor: Event Coordinator</h3>
    <p>With a background in event planning, Aisha manages our fundraising galas and community awareness events. Her attention to detail and creative vision have helped our events grow in both attendance and fundraising results. "Planning events that bring people together for a cause I believe in combines my professional skills with my personal values," Aisha shares. "Seeing the direct impact of funds raised at our events makes all the late nights worth it."</p>
    
    <h3>Robert Kincaid: Volunteer Photographer</h3>
    <p>A professional photographer, Robert documents our projects and the communities we serve, creating powerful visual narratives that help communicate our impact. "Images can tell stories that words alone cannot," Robert explains. "By showing the faces and places behind the statistics, I hope to help people connect emotionally with these important causes."</p>
    
    <h3>Becoming a Volunteer</h3>
    <p>Our volunteers contribute in countless ways, from professional services to hands-on program support. Whatever your skills and availability, there's a meaningful way for you to get involved. Visit our volunteer page to learn about current opportunities and join this remarkable community of change-makers.</p>`,
    imageUrl: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
    date: "October 18, 2022",
    author: "Thomas Brown",
    category: "Volunteer Stories"
  }
];

export default function BlogPage() {
  const [selectedBlog, setSelectedBlog] = useState<typeof blogPosts[0] | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openBlogModal = (blog: typeof blogPosts[0]) => {
    setSelectedBlog(blog);
    setIsModalOpen(true);
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold mb-4">Our Blog</h1>
        <p className="text-slate-600 max-w-2xl mx-auto">
          Stay updated with our latest news, impact stories, and insights on how your donations are making a difference around the world.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {blogPosts.map((blog) => (
          <Card key={blog.id} className="overflow-hidden flex flex-col h-full">
            <div className="relative h-48 overflow-hidden">
              <img 
                src={blog.imageUrl} 
                alt={blog.title} 
                className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
              />
              <div className="absolute top-3 right-3 bg-primary text-white text-xs px-2 py-1 rounded">
                {blog.category}
              </div>
            </div>
            <div className="p-5 flex flex-col flex-grow">
              <div className="text-sm text-slate-500 mb-2">
                {blog.date} • By {blog.author}
              </div>
              <h3 className="text-xl font-bold mb-3">{blog.title}</h3>
              <p className="text-slate-600 mb-4 flex-grow">{blog.excerpt}</p>
              <Button 
                variant="outline" 
                className="mt-auto"
                onClick={() => openBlogModal(blog)}
              >
                Read More
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Blog Detail Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedBlog && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">{selectedBlog.title}</DialogTitle>
                <DialogDescription className="text-sm text-slate-500">
                  {selectedBlog.date} • By {selectedBlog.author} • {selectedBlog.category}
                </DialogDescription>
              </DialogHeader>
              
              <div className="mt-4">
                <img 
                  src={selectedBlog.imageUrl} 
                  alt={selectedBlog.title} 
                  className="w-full h-64 object-cover rounded-md mb-6"
                />
                <div 
                  className="prose prose-slate max-w-none"
                  dangerouslySetInnerHTML={{ __html: selectedBlog.content }}
                />
              </div>
              
              <div className="mt-6 flex justify-between items-center">
                <Button variant="outline" asChild>
                  <Link href="/campaigns">Support Our Work</Link>
                </Button>
                <DialogClose asChild>
                  <Button variant="ghost">Close</Button>
                </DialogClose>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}