import { useState, useEffect } from 'react';

// Sample donor data
const donors = [
    { id: 1, name: "Rahul Verma", amount: 250, comment: "Even stars can't shine without darkness first.", avatar: "https://randomuser.me/api/portraits/men/11.jpg", location: "Chennai" },
    { id: 2, name: "Ananya Desai", amount: 150, comment: "Giving is the only adventure I believe in.", avatar: "https://randomuser.me/api/portraits/women/12.jpg", location: "Goa" },
    { id: 3, name: "Karthik Iyer", amount: 300, comment: "This donation comes with free good vibes!", avatar: "https://randomuser.me/api/portraits/men/13.jpg", location: "Trivandrum" },
    { id: 4, name: "Divya Menon", amount: 175, comment: "My small contribution to your big dreams.", avatar: "https://randomuser.me/api/portraits/women/14.jpg", location: "Coimbatore" },
    { id: 5, name: "Prakash Yadav", amount: 225, comment: "Giving feels better than receiving - tested!", avatar: "https://randomuser.me/api/portraits/men/15.jpg", location: "Patna" },
    { id: 6, name: "Shreya Malhotra", amount: 350, comment: "May this multiply like rabbits in spring!", avatar: "https://randomuser.me/api/portraits/women/16.jpg", location: "Chandigarh" },
    { id: 7, name: "Vivek Rana", amount: 125, comment: "From my wallet to your worthy cause.", avatar: "https://randomuser.me/api/portraits/men/17.jpg", location: "Dehradun" },
    { id: 8, name: "Isha Banerjee", amount: 275, comment: "This donation was brewed with care.", avatar: "https://randomuser.me/api/portraits/women/18.jpg", location: "Kolkata" },
    { id: 9, name: "Aditya Kapoor", amount: 400, comment: "Giving is my favorite form of shopping.", avatar: "https://randomuser.me/api/portraits/men/19.jpg", location: "Lucknow" },
    { id: 10, name: "Tanvi Saxena", amount: 100, comment: "Small amount, big hopes!", avatar: "https://randomuser.me/api/portraits/women/20.jpg", location: "Bhopal" },
    { id: 11, name: "Rohit Khanna", amount: 450, comment: "This donation comes with virtual hugs!", avatar: "https://randomuser.me/api/portraits/men/21.jpg", location: "Nagpur" },
    { id: 12, name: "Pooja Mehra", amount: 325, comment: "Planting seeds for a better tomorrow.", avatar: "https://randomuser.me/api/portraits/women/22.jpg", location: "Indore" },
    { id: 13, name: "Siddharth Bose", amount: 200, comment: "Giving is the real currency of life.", avatar: "https://randomuser.me/api/portraits/men/23.jpg", location: "Guwahati" },
    { id: 14, name: "Anjali Choudhary", amount: 375, comment: "May this small drop create big ripples.", avatar: "https://randomuser.me/api/portraits/women/24.jpg", location: "Bhubaneswar" },
    { id: 15, name: "Nikhil Agarwal", amount: 150, comment: "My contribution comes with a side of hope.", avatar: "https://randomuser.me/api/portraits/men/25.jpg", location: "Vadodara" },
    { id: 16, name: "Maya Srinivasan", amount: 425, comment: "Giving is the best communication.", avatar: "https://randomuser.me/api/portraits/women/26.jpg", location: "Mysore" },
    { id: 17, name: "Arun Gupta", amount: 175, comment: "This amount was earned with smiles.", avatar: "https://randomuser.me/api/portraits/men/27.jpg", location: "Raipur" },
    { id: 18, name: "Kavita Reddy", amount: 300, comment: "Sharing is caring squared!", avatar: "https://randomuser.me/api/portraits/women/28.jpg", location: "Visakhapatnam" },
    { id: 19, name: "Rajat Mehra", amount: 250, comment: "My wallet is lighter but my heart is fuller.", avatar: "https://randomuser.me/api/portraits/men/29.jpg", location: "Jodhpur" },
    { id: 20, name: "Sonia Chatterjee", amount: 500, comment: "This donation is powered by kindness.", avatar: "https://randomuser.me/api/portraits/women/30.jpg", location: "Allahabad" },
    { id: 21, name: "Vijay Shetty", amount: 100, comment: "Little drops make mighty oceans.", avatar: "https://randomuser.me/api/portraits/men/31.jpg", location: "Mangalore" },
    { id: 22, name: "Preeti Nair", amount: 350, comment: "Giving is the art of living.", avatar: "https://randomuser.me/api/portraits/women/32.jpg", location: "Thrissur" },
    { id: 23, name: "Harish Pandey", amount: 225, comment: "This amount comes with good karma points!", avatar: "https://randomuser.me/api/portraits/men/33.jpg", location: "Kanpur" },
    { id: 24, name: "Ayesha Khan", amount: 400, comment: "Sharing is the new keeping.", avatar: "https://randomuser.me/api/portraits/women/34.jpg", location: "Srinagar" },
    { id: 25, name: "Deepak Joshi", amount: 125, comment: "May this small help grow big dreams.", avatar: "https://randomuser.me/api/portraits/men/35.jpg", location: "Shimla" },
    { id: 26, name: "Ritu Oberoi", amount: 475, comment: "Giving is my favorite exercise.", avatar: "https://randomuser.me/api/portraits/women/36.jpg", location: "Gurgaon" },
    { id: 27, name: "Manish Chawla", amount: 150, comment: "This donation is made with love and pixels.", avatar: "https://randomuser.me/api/portraits/men/37.jpg", location: "Faridabad" },
    { id: 28, name: "Swati Bajaj", amount: 325, comment: "Sharing multiplies happiness.", avatar: "https://randomuser.me/api/portraits/women/38.jpg", location: "Noida" },
    { id: 29, name: "Alok Dubey", amount: 200, comment: "This amount comes with virtual high-fives!", avatar: "https://randomuser.me/api/portraits/men/39.jpg", location: "Ranchi" },
    { id: 30, name: "Neeta Kapoor", amount: 275, comment: "Giving is the best ROI in life.", avatar: "https://randomuser.me/api/portraits/women/40.jpg", location: "Jamshedpur" },
    { id: 31, name: "Sanjay Malhotra", amount: 450, comment: "This donation is made of hope and WiFi.", avatar: "https://randomuser.me/api/portraits/men/41.jpg", location: "Amritsar" },
    { id: 32, name: "Pallavi Rao", amount: 175, comment: "Small help today for big change tomorrow.", avatar: "https://randomuser.me/api/portraits/women/42.jpg", location: "Vijayawada" },
    { id: 33, name: "Rakesh Menon", amount: 300, comment: "Giving is the ultimate self-care.", avatar: "https://randomuser.me/api/portraits/men/43.jpg", location: "Madurai" },
    { id: 34, name: "Anita Deshpande", amount: 225, comment: "This amount comes with cosmic blessings!", avatar: "https://randomuser.me/api/portraits/women/44.jpg", location: "Aurangabad" },
    { id: 35, name: "Vishal Bhatia", amount: 375, comment: "Sharing is the currency of kind souls.", avatar: "https://randomuser.me/api/portraits/men/45.jpg", location: "Bhilai" },
    { id: 36, name: "Sunita Agarwal", amount: 125, comment: "May this small help bloom big.", avatar: "https://randomuser.me/api/portraits/women/46.jpg", location: "Tiruchirappalli" },
    { id: 37, name: "Rajeev Nanda", amount: 500, comment: "Giving is the art of graceful living.", avatar: "https://randomuser.me/api/portraits/men/47.jpg", location: "Warangal" },
    { id: 38, name: "Mona Sharma", amount: 150, comment: "This donation comes with good vibes.", avatar: "https://randomuser.me/api/portraits/women/48.jpg", location: "Guntur" },
    { id: 39, name: "Amar Sinha", amount: 350, comment: "Sharing is caring in action.", avatar: "https://randomuser.me/api/portraits/men/49.jpg", location: "Bikaner" },
    { id: 40, name: "Kiran Bedi", amount: 250, comment: "This amount is sprinkled with hope.", avatar: "https://randomuser.me/api/portraits/women/50.jpg", location: "Ajmer" },
    { id: 41, name: "Dinesh Choudhury", amount: 425, comment: "Giving is my favorite hobby.", avatar: "https://randomuser.me/api/portraits/men/51.jpg", location: "Udaipur" },
    { id: 42, name: "Esha Gupta", amount: 175, comment: "Small help, big heart.", avatar: "https://randomuser.me/api/portraits/women/52.jpg", location: "Jhansi" },
    { id: 43, name: "Farhan Qureshi", amount: 300, comment: "This donation is made of moonlight.", avatar: "https://randomuser.me/api/portraits/men/53.jpg", location: "Rourkela" },
    { id: 44, name: "Geeta Iyengar", amount: 100, comment: "Sharing is the best algorithm.", avatar: "https://randomuser.me/api/portraits/women/54.jpg", location: "Kollam" },
    { id: 45, name: "Harshad Mehta", amount: 475, comment: "Giving is the real wealth.", avatar: "https://randomuser.me/api/portraits/men/55.jpg", location: "Salem" },
    { id: 46, name: "Indira Patel", amount: 200, comment: "This amount comes with sunshine.", avatar: "https://randomuser.me/api/portraits/women/56.jpg", location: "Tirunelveli" },
    { id: 47, name: "Jayant Rao", amount: 325, comment: "Sharing is the ultimate upgrade.", avatar: "https://randomuser.me/api/portraits/men/57.jpg", location: "Kurnool" },
    { id: 48, name: "Kavita Krishnan", amount: 150, comment: "Giving is my superpower.", avatar: "https://randomuser.me/api/portraits/women/58.jpg", location: "Aligarh" },
    { id: 49, name: "Lalit Mohan", amount: 400, comment: "This donation is made of stardust.", avatar: "https://randomuser.me/api/portraits/men/59.jpg", location: "Bareilly" },
    { id: 50, name: "Meenakshi Sundaram", amount: 225, comment: "Sharing is the best investment.", avatar: "https://randomuser.me/api/portraits/women/60.jpg", location: "Moradabad" },
    { id: 51, name: "Naveen Trivedi", amount: 275, comment: "Giving is the art of abundance.", avatar: "https://randomuser.me/api/portraits/men/61.jpg", location: "Bhiwandi" },
    { id: 52, name: "Omprakash Yadav", amount: 125, comment: "This amount comes with good wishes.", avatar: "https://randomuser.me/api/portraits/men/62.jpg", location: "Saharanpur" },
    { id: 53, name: "Padmini Nair", amount: 450, comment: "Sharing is caring in HD.", avatar: "https://randomuser.me/api/portraits/women/63.jpg", location: "Gorakhpur" },
    { id: 54, name: "Qasim Khan", amount: 175, comment: "Giving is the best medicine.", avatar: "https://randomuser.me/api/portraits/men/64.jpg", location: "Bikaner" },
    { id: 55, name: "Radhika Menon", amount: 350, comment: "This donation is made of dreams.", avatar: "https://randomuser.me/api/portraits/women/65.jpg", location: "Amravati" },
    { id: 56, name: "Suresh Babu", amount: 200, comment: "Sharing is the ultimate hack.", avatar: "https://randomuser.me/api/portraits/men/66.jpg", location: "Nanded" },
    { id: 57, name: "Tanya Malhotra", amount: 375, comment: "Giving is my favorite app.", avatar: "https://randomuser.me/api/portraits/women/67.jpg", location: "Kolhapur" },
    { id: 58, name: "Uday Chopra", amount: 250, comment: "This amount comes with blessings.", avatar: "https://randomuser.me/api/portraits/men/68.jpg", location: "Bilaspur" },
    { id: 59, name: "Vaishali Reddy", amount: 100, comment: "Small help, big impact.", avatar: "https://randomuser.me/api/portraits/women/69.jpg", location: "Bhagalpur" },
    { id: 60, name: "Wilson Pereira", amount: 500, comment: "Giving is the real success.", avatar: "https://randomuser.me/api/portraits/men/70.jpg", location: "Muzaffarpur" },
    { id: 61, name: "Yamini Gupta", amount: 150, comment: "This donation is made of kindness.", avatar: "https://randomuser.me/api/portraits/women/71.jpg", location: "Parbhani" },
    { id: 62, name: "Zubin Mehta", amount: 325, comment: "Sharing is the best policy.", avatar: "https://randomuser.me/api/portraits/men/72.jpg", location: "Panipat" },
    { id: 63, name: "Aarav Sharma", amount: 225, comment: "Giving is the art of joy.", avatar: "https://randomuser.me/api/portraits/men/73.jpg", location: "Kharagpur" },
    { id: 64, name: "Bhavna Patel", amount: 400, comment: "This amount comes with love.", avatar: "https://randomuser.me/api/portraits/women/74.jpg", location: "Aizawl" },
    { id: 65, name: "Chirag Joshi", amount: 175, comment: "Small help, big difference.", avatar: "https://randomuser.me/api/portraits/men/75.jpg", location: "Imphal" },
    { id: 66, name: "Dipika Singh", amount: 300, comment: "Giving is the real luxury.", avatar: "https://randomuser.me/api/portraits/women/76.jpg", location: "Agartala" },
    { id: 67, name: "Ehsan Khan", amount: 250, comment: "This donation is made of hope.", avatar: "https://randomuser.me/api/portraits/men/77.jpg", location: "Kohima" },
    { id: 68, name: "Fatima Sheikh", amount: 125, comment: "Sharing is the best therapy.", avatar: "https://randomuser.me/api/portraits/women/78.jpg", location: "Shillong" },
    { id: 69, name: "Gautam Verma", amount: 475, comment: "Giving is the ultimate joy.", avatar: "https://randomuser.me/api/portraits/men/79.jpg", location: "Gangtok" },
    { id: 70, name: "Hema Srinivasan", amount: 200, comment: "This amount comes with smiles.", avatar: "https://randomuser.me/api/portraits/women/80.jpg", location: "Itanagar" },
    { id: 71, name: "Ishaan Patel", amount: 350, comment: "Small help, big change.", avatar: "https://randomuser.me/api/portraits/men/81.jpg", location: "Dispur" },
    { id: 72, name: "Jaya Nair", amount: 150, comment: "Giving is the real happiness.", avatar: "https://randomuser.me/api/portraits/women/82.jpg", location: "Kavaratti" },
    { id: 73, name: "Karan Johar", amount: 425, comment: "This donation is made of care.", avatar: "https://randomuser.me/api/portraits/men/83.jpg", location: "Pondicherry" },
    { id: 74, name: "Lata Mangeshkar", amount: 175, comment: "Sharing is the best gift.", avatar: "https://randomuser.me/api/portraits/women/84.jpg", location: "Port Blair" },
    { id: 75, name: "Manish Paul", amount: 300, comment: "Giving is the art of giving.", avatar: "https://randomuser.me/api/portraits/men/85.jpg", location: "Silvassa" },
    { id: 76, name: "Neha Kakkar", amount: 225, comment: "This amount comes with luck.", avatar: "https://randomuser.me/api/portraits/women/86.jpg", location: "Daman" },
    { id: 77, name: "Om Puri", amount: 375, comment: "Small help, big dreams.", avatar: "https://randomuser.me/api/portraits/men/87.jpg", location: "Diū" },
    { id: 78, name: "Priyanka Chopra", amount: 125, comment: "Giving is the real power.", avatar: "https://randomuser.me/api/portraits/women/88.jpg", location: "Karaikal" },
    { id: 79, name: "Rahul Dravid", amount: 500, comment: "This donation is made of joy.", avatar: "https://randomuser.me/api/portraits/men/89.jpg", location: "Mahe" },
    { id: 80, name: "Sunita Williams", amount: 150, comment: "Sharing is the best decision.", avatar: "https://randomuser.me/api/portraits/women/90.jpg", location: "Yanam" },
    { id: 81, name: "Tarak Mehta", amount: 325, comment: "Giving is the real treasure.", avatar: "https://randomuser.me/api/portraits/men/91.jpg", location: "Lakshadweep" },
    { id: 82, name: "Urmila Matondkar", amount: 200, comment: "This amount comes with love.", avatar: "https://randomuser.me/api/portraits/women/92.jpg", location: "Dadra" },
    { id: 83, name: "Virender Sehwag", amount: 275, comment: "Small help, big results.", avatar: "https://randomuser.me/api/portraits/men/93.jpg", location: "Nagaur" },
    { id: 84, name: "Waheeda Rehman", amount: 150, comment: "Giving is the real blessing.", avatar: "https://randomuser.me/api/portraits/women/94.jpg", location: "Pali" },
    { id: 85, name: "Xavier Britto", amount: 450, comment: "This donation is made of faith.", avatar: "https://randomuser.me/api/portraits/men/95.jpg", location: "Sikar" },
    { id: 86, name: "Yuvraj Singh", amount: 175, comment: "Sharing is the best action.", avatar: "https://randomuser.me/api/portraits/men/96.jpg", location: "Tonk" },
    { id: 87, name: "Zeenat Aman", amount: 300, comment: "Giving is the real wealth.", avatar: "https://randomuser.me/api/portraits/women/97.jpg", location: "Banswara" },
    { id: 88, name: "Akshay Kumar", amount: 225, comment: "This amount comes with hope.", avatar: "https://randomuser.me/api/portraits/men/98.jpg", location: "Baran" },
    { id: 89, name: "Bipasha Basu", amount: 375, comment: "Small help, big impact.", avatar: "https://randomuser.me/api/portraits/women/99.jpg", location: "Bundi" },
    { id: 90, name: "Chiranjeevi", amount: 125, comment: "Giving is the real joy.", avatar: "https://randomuser.me/api/portraits/men/100.jpg", location: "Dungarpur" },
    { id: 91, name: "Deepika Padukone", amount: 500, comment: "This donation is made of dreams.", avatar: "https://randomuser.me/api/portraits/women/101.jpg", location: "Jhalawar" },
    { id: 92, name: "Emraan Hashmi", amount: 150, comment: "Sharing is the best choice.", avatar: "https://randomuser.me/api/portraits/men/102.jpg", location: "Kota" },
    { id: 93, name: "Farhan Akhtar", amount: 325, comment: "Giving is the real happiness.", avatar: "https://randomuser.me/api/portraits/men/103.jpg", location: "Rajsamand" },
    { id: 94, name: "Genelia D'Souza", amount: 200, comment: "This amount comes with luck.", avatar: "https://randomuser.me/api/portraits/women/104.jpg", location: "Sawai Madhopur" },
    { id: 95, name: "Hrithik Roshan", amount: 275, comment: "Small help, big change.", avatar: "https://randomuser.me/api/portraits/men/105.jpg", location: "Sirohi" },
    { id: 96, name: "Ileana D'Cruz", amount: 150, comment: "Giving is the real power.", avatar: "https://randomuser.me/api/portraits/women/106.jpg", location: "Pratapgarh" },
    { id: 97, name: "John Abraham", amount: 450, comment: "This donation is made of care.", avatar: "https://randomuser.me/api/portraits/men/107.jpg", location: "Dholpur" },
    { id: 98, name: "Kajol Devgan", amount: 175, comment: "Sharing is the best gift.", avatar: "https://randomuser.me/api/portraits/women/108.jpg", location: "Bharatpur" },
    { id: 99, name: "Lara Dutta", amount: 300, comment: "Giving is the real treasure.", avatar: "https://randomuser.me/api/portraits/women/109.jpg", location: "Karauli" },
    { id: 100, name: "Madhuri Dixit", amount: 225, comment: "This amount comes with love.", avatar: "https://randomuser.me/api/portraits/women/110.jpg", location: "Dausa" }
  ];

export default function RecentDonations() {
  const [currentDonor, setCurrentDonor] = useState<typeof donors[0] | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);
  const [donationCount, setDonationCount] = useState(0);

  // Function to get a random donor
  const getRandomDonor = () => {
    const randomIndex = Math.floor(Math.random() * donors.length);
    return donors[randomIndex];
  };

  // Simulate new donations every few seconds
  useEffect(() => {
    // Show initial donation immediately
    const initialDonor = getRandomDonor();
    setCurrentDonor(initialDonor);
    setIsVisible(true);
    setTotalAmount(initialDonor.amount);
    setDonationCount(1);

    // Set up interval for subsequent donations
    const interval = setInterval(() => {
      // Hide current donation
      setIsVisible(false);
      
      // Wait for exit animation to complete
      setTimeout(() => {
        // Get new random donor
        const newDonor = getRandomDonor();
        setCurrentDonor(newDonor);
        
        // Update stats
        setTotalAmount(prev => prev + newDonor.amount);
        setDonationCount(prev => prev + 1);
        
        // Show new donation
        setIsVisible(true);
      }, 500);
    }, 5000); // Change donation every 5 seconds

    return () => clearInterval(interval);
  }, []);

  if (!currentDonor) return null;

  return (
    <section className="py-12 bg-gradient-to-r from-orange-50 to-white mb-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <div className="inline-block rounded-full bg-orange-100 text-orange-600 py-1 px-3 mb-3">
            Live Donations
          </div>
          <h2 className="text-3xl font-bold">Watch Donations Happening in Real-Time</h2>
          <div className="w-20 h-1 bg-orange-500 mx-auto mt-4"></div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between max-w-5xl mx-auto">
          {/* Stats cards */}
          <div className="grid grid-cols-2 gap-4 mb-8 md:mb-0">
            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-orange-500 text-center">
              <div className="text-3xl font-bold text-orange-600">₹{totalAmount.toLocaleString()}</div>
              <div className="text-gray-600">Total Donated</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-orange-500 text-center">
              <div className="text-3xl font-bold text-orange-600">{donationCount}</div>
              <div className="text-gray-600">Donations</div>
            </div>
          </div>

          {/* Live donation card */}
          <div 
            className={`bg-white rounded-lg shadow-lg p-6 max-w-md w-full transition-all duration-500 transform ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}
          >
            <div className="flex items-start">
              <div className="relative mr-4">
                <img 
                  src={currentDonor.avatar} 
                  alt={currentDonor.name} 
                  className="w-16 h-16 rounded-full object-cover border-2 border-orange-300"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = `https://ui-avatars.com/api/?name=${currentDonor.name.replace(' ', '+')}&background=FB923C&color=fff`;
                  }}
                />
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
              </div>
              
              <div className="flex-1">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold text-gray-800">{currentDonor.name}</h3>
                    <p className="text-sm text-gray-500">{currentDonor.location}</p>
                  </div>
                  <div className="bg-orange-100 text-orange-600 font-bold py-1 px-3 rounded-full text-sm">
                    ₹{currentDonor.amount}
                  </div>
                </div>
                
                <p className="text-gray-600 text-sm italic">"{currentDonor.comment}"</p>
                
                <div className="mt-3 flex items-center">
                  <div className="flex items-center text-orange-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-xs">Just now</span>
                  </div>
                  
                  <div className="ml-auto flex items-center">
                    <div className="flex space-x-1">
                      <span className="inline-block w-2 h-2 bg-orange-500 rounded-full animate-ping"></span>
                      <span className="inline-block w-2 h-2 bg-orange-500 rounded-full animate-ping" style={{ animationDelay: '0.2s' }}></span>
                      <span className="inline-block w-2 h-2 bg-orange-500 rounded-full animate-ping" style={{ animationDelay: '0.4s' }}></span>
                    </div>
                    <span className="text-xs text-orange-600 ml-1">Live</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Inspirational message */}
        <div className="text-center mt-10 max-w-2xl mx-auto">
          <p className="text-gray-600 italic">
            "Every donation, no matter how small, creates ripples of change that transform lives. 
            Join our community of givers and be part of something bigger than yourself."
          </p>
          <div className="mt-4">
            <a href="/campaigns" className="inline-flex items-center text-orange-600 hover:text-orange-700 font-medium">
              Make Your Donation
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
