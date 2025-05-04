import { Card, CardContent } from "@/components/ui/card";

const JournalGallery = () => {
  const galleryItems = [
    {
      image: "https://images.unsplash.com/photo-1517842645767-c639042777db?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=350&q=80",
      title: "Start a gratitude practice",
      description: "Record three things you're grateful for each day"
    },
    {
      image: "https://images.unsplash.com/photo-1544703135-ca5594e347d5?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=350&q=80",
      title: "Morning reflection",
      description: "Set intentions for your day ahead"
    },
    {
      image: "https://images.unsplash.com/photo-1483546416237-76fd26bbcdd1?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=350&q=80",
      title: "Nature inspiration",
      description: "Journal about peaceful outdoor moments"
    },
    {
      image: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=350&q=80",
      title: "Growth tracking",
      description: "Monitor your personal development journey"
    }
  ];

  return (
    <div>
      <h2 className="font-header text-xl font-semibold mb-4">Your Journal Journey</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {galleryItems.map((item, index) => (
          <Card key={index} className="rounded-lg overflow-hidden shadow-journal">
            <img 
              src={item.image} 
              alt={item.title} 
              className="w-full h-48 object-cover" 
            />
            <CardContent className="p-4 bg-white">
              <h3 className="font-medium">{item.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default JournalGallery;
