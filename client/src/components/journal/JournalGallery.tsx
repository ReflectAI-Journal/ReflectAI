import { Link } from "wouter";
import { PenLine, Target, MessageCircleHeart, Brain } from "lucide-react";

const JournalGallery = () => {
  const galleryItems = [
    {
      icon: <PenLine className="h-5 w-5" />,
      title: "Daily Journal",
      description: "Record your thoughts and reflections every day",
      link: "/",
      color: "from-blue-500 to-purple-600"
    },
    {
      icon: <Target className="h-5 w-5" />,
      title: "Goals",
      description: "Track your life goals and personal development",
      link: "/goals",
      color: "from-green-500 to-teal-600"
    },
    {
      icon: <MessageCircleHeart className="h-5 w-5" />,
      title: "Talk to an AI Counselor",
      description: "Get emotional support and advice from AI",
      link: "/chat",
      color: "from-pink-500 to-rose-600"
    },
    {
      icon: <Brain className="h-5 w-5" />,
      title: "Philosopher",
      description: "Explore deep questions with an AI philosopher",
      link: "/philosopher",
      color: "from-purple-500 to-indigo-600"
    }
  ];

  return (
    <div>
      <h2 className="font-header text-xl font-semibold mb-4">Your Journal Journey</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {galleryItems.map((item, index) => (
          <Link key={index} href={item.link}>
            <div className="group relative bg-card rounded-lg shadow-journal overflow-hidden border border-border/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              {/* Animated gradient background on hover */}
              <div className={`absolute inset-0 bg-gradient-to-tr ${item.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
              
              {/* Content with animated text color change */}
              <div className="relative z-10 p-6 flex flex-col items-center text-center h-full">
                <div className="h-12 w-12 rounded-full bg-card flex items-center justify-center mb-4 group-hover:bg-white/20 transition-colors duration-300">
                  <div className="text-primary group-hover:text-white transition-colors duration-300">
                    {item.icon}
                  </div>
                </div>
                <h3 className="font-medium text-lg mb-2 group-hover:text-white transition-colors duration-300">{item.title}</h3>
                <p className="text-sm text-muted-foreground mt-1 group-hover:text-white/80 transition-colors duration-300">{item.description}</p>
                
                {/* Animated underline */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-white group-hover:w-16 transition-all duration-300"></div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default JournalGallery;
