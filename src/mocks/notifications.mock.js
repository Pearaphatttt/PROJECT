export const notificationsMock = [
  {
    id: "notif-1",
    type: "match",
    title: "You are matched with BrightTech Inc.!",
    message: "Congratulations! Your application for Software Developer Intern has been accepted.",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    read: false,
    internshipId: "int-1",
  },
  {
    id: "notif-2",
    type: "message",
    title: "New message from BrightTech Inc.",
    message: "Hi! We'd like to schedule an interview with you.",
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    read: false,
    internshipId: "int-1",
  },
  {
    id: "notif-3",
    type: "application",
    title: "Application received",
    message: "Your application for Marketing Assistant Intern has been received.",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    read: true,
    internshipId: "int-2",
  },
];

