export const chatMock = {
  "int-1": [
    {
      id: "msg-1",
      sender: "hr",
      senderName: "HR Manager",
      text: "Hello! Thank you for your interest in our Software Developer Intern position.",
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      type: "text",
    },
    {
      id: "msg-2",
      sender: "student",
      senderName: "You",
      text: "Thank you! I'm very excited about this opportunity.",
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 60 * 1000).toISOString(),
      type: "text",
    },
    {
      id: "msg-3",
      sender: "hr",
      senderName: "HR Manager",
      text: "Great! We'd like to schedule an interview with you. Are you available this week?",
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      type: "text",
    },
    {
      id: "msg-4",
      sender: "hr",
      senderName: "HR Manager",
      text: "Interview Schedule",
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      type: "interview",
      interviewData: {
        date: "2024-01-15",
        time: "14:00",
        duration: "60 minutes",
        format: "Video Call",
        link: "https://meet.example.com/interview-123",
      },
    },
  ],
};

