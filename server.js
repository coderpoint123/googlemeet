const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(cors());

const PORT = process.env.PORT || 3000;

// Each time slot has 4 availability slots
let slots = [
  {
    id: 1,
    time: "10:00 AM - 11:00 AM",
    availability: [
      { subId: 1, booked: false, bookedBy: null, meetLink: null },
      { subId: 2, booked: false, bookedBy: null, meetLink: null },
      { subId: 3, booked: false, bookedBy: null, meetLink: null },
      { subId: 4, booked: false, bookedBy: null, meetLink: null }
    ]
  },
  {
    id: 2,
    time: "11:00 AM - 12:00 PM",
    availability: [
      { subId: 1, booked: false, bookedBy: null, meetLink: null },
      { subId: 2, booked: false, bookedBy: null, meetLink: null },
      { subId: 3, booked: false, bookedBy: null, meetLink: null },
      { subId: 4, booked: false, bookedBy: null, meetLink: null }
    ]
  },
  {
    id: 3,
    time: "01:00 PM - 02:00 PM",
    availability: [
      { subId: 1, booked: false, bookedBy: null, meetLink: null },
      { subId: 2, booked: false, bookedBy: null, meetLink: null },
      { subId: 3, booked: false, bookedBy: null, meetLink: null },
      { subId: 4, booked: false, bookedBy: null, meetLink: null }
    ]
  },
  {
    id: 4,
    time: "02:00 PM - 03:00 PM",
    availability: [
      { subId: 1, booked: false, bookedBy: null, meetLink: null },
      { subId: 2, booked: false, bookedBy: null, meetLink: null },
      { subId: 3, booked: false, bookedBy: null, meetLink: null },
      { subId: 4, booked: false, bookedBy: null, meetLink: null }
    ]
  }
];

// Generate a random Google Meet link
function generateMeetLink() {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let linkCode = '';
  for (let i = 0; i < 10; i++) {
    linkCode += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `https://meet.google.com/${linkCode}`;
}

// Fetch all slots
app.get('/slots', (req, res) => {
  res.json(slots);
});

// Book a sub-slot
app.post('/book', (req, res) => {
  const { id, subId, name, email } = req.body;
  const slot = slots.find(s => s.id === id);
  if (slot) {
    const subSlot = slot.availability.find(a => a.subId === subId);
    if (subSlot && !subSlot.booked) {
      subSlot.booked = true;
      subSlot.bookedBy = { name, email };
      subSlot.meetLink = generateMeetLink(); // Generate and add the Google Meet link
      res.json({ success: true, slot, subSlot });
    } else {
      res.status(400).json({ success: false, message: 'Sub-slot already booked or invalid' });
    }
  } else {
    res.status(400).json({ success: false, message: 'Slot not found' });
  }
});

// Cancel a booking
app.post('/cancel', (req, res) => {
  const { id, subId } = req.body;
  const slot = slots.find(s => s.id === id);
  if (slot) {
    const subSlot = slot.availability.find(a => a.subId === subId);
    if (subSlot && subSlot.booked) {
      subSlot.booked = false;
      subSlot.bookedBy = null;
      subSlot.meetLink = null; // Reset the Google Meet link
      res.json({ success: true, slot, subSlot });
    } else {
      res.status(400).json({ success: false, message: 'Sub-slot not booked or invalid' });
    }
  } else {
    res.status(400).json({ success: false, message: 'Slot not found' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
// Fetch all booked slots
app.get('/bookedSlots', (req, res) => {
  const bookedSlots = [];
  slots.forEach(slot => {
    slot.availability.forEach(subSlot => {
      if (subSlot.booked) {
        bookedSlots.push({
          mainSlotId: slot.id,
          mainSlotTime: slot.time,
          subSlotId: subSlot.subId,
          bookedBy: subSlot.bookedBy,
          meetLink: subSlot.meetLink
        });
      }
    });
  });
  res.json(bookedSlots);
});

