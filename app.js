document.addEventListener("DOMContentLoaded", () => {
  fetchSlots();
  fetchBookedSlots(); // Fetch booked slots on page load
});

function fetchSlots() {
  fetch('http://localhost:3000/slots')
    .then(response => response.json())
    .then(data => {
      const slotsContainer = document.getElementById('slots');
      slotsContainer.innerHTML = '';
      data.forEach(slot => {
        const slotDiv = document.createElement('div');
        slotDiv.className = 'slot';

        // Main slot header
        const slotHeader = document.createElement('div');
        slotHeader.className = 'slot-header';
        slotHeader.textContent = slot.time;
        slotDiv.appendChild(slotHeader);

        // Sub-slots
        slot.availability.forEach(subSlot => {
          const subSlotDiv = document.createElement('div');
          subSlotDiv.className = `sub-slot${subSlot.booked ? ' booked' : ''}`;
          subSlotDiv.textContent = `Sub-slot ${subSlot.subId}`;
          subSlotDiv.dataset.slotId = slot.id;
          subSlotDiv.dataset.subSlotId = subSlot.subId;
          subSlotDiv.onclick = () => openPopup(slot.id, subSlot.subId);

          if (subSlot.booked) {
            // Show Google Meet link
            const meetLink = document.createElement('a');
            meetLink.className = 'meet-link';
            meetLink.href = subSlot.meetLink;
            meetLink.target = '_blank';
            meetLink.textContent = 'Join Google Meet';
            subSlotDiv.appendChild(meetLink);

            const cancelButton = document.createElement('button');
            cancelButton.textContent = 'Cancel';
            cancelButton.onclick = (e) => {
              e.stopPropagation();
              cancelBooking(slot.id, subSlot.subId);
            };
            subSlotDiv.appendChild(cancelButton);
          }

          slotDiv.appendChild(subSlotDiv);
        });

        slotsContainer.appendChild(slotDiv);
      });
    });
}

function openPopup(slotId, subSlotId) {
  const popup = document.getElementById('bookingPopup');
  popup.style.display = 'block';
  document.getElementById('name').dataset.slotId = slotId;
  document.getElementById('name').dataset.subSlotId = subSlotId;
}

function closePopup() {
  const popup = document.getElementById('bookingPopup');
  popup.style.display = 'none';
  document.getElementById('name').value = '';
  document.getElementById('email').value = '';
}

function bookSlot() {
  const id = parseInt(document.getElementById('name').dataset.slotId);
  const subId = parseInt(document.getElementById('name').dataset.subSlotId);
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;

  fetch('http://localhost:3000/book', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ id, subId, name, email }),
  })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        alert('Sub-slot booked successfully. Your Google Meet link is ' + data.subSlot.meetLink);
        fetchSlots();
        fetchBookedSlots(); // Refresh the list of booked slots
        closePopup();
      } else {
        alert(data.message);
      }
    });
}

function cancelBooking(slotId, subSlotId) {
  fetch('http://localhost:3000/cancel', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ id: slotId, subId: subSlotId }),
  })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        alert('Booking cancelled successfully');
        fetchSlots();
        fetchBookedSlots(); // Refresh the list of booked slots
      } else {
        alert(data.message);
      }
    });
}

function fetchBookedSlots() {
  fetch('http://localhost:3000/bookedSlots')
    .then(response => response.json())
    .then(data => {
      const bookedSlotsContainer = document.getElementById('bookedSlots');
      bookedSlotsContainer.innerHTML = '';
      if (data.length === 0) {
        bookedSlotsContainer.textContent = 'No slots booked.';
        return;
      }
      data.forEach(bookedSlot => {
        const bookedSlotDiv = document.createElement('div');
        bookedSlotDiv.className = 'booked-slot';
        bookedSlotDiv.innerHTML = `
          <strong>Time:</strong> ${bookedSlot.mainSlotTime} <br>
          <strong>Sub-slot:</strong> ${bookedSlot.subSlotId} <br>
          <strong>Name:</strong> ${bookedSlot.bookedBy.name} <br>
          <strong>Email:</strong> ${bookedSlot.bookedBy.email} <br>
          <a href="${bookedSlot.meetLink}" target="_blank" class="meet-link">Join Google Meet</a>
        `;
        bookedSlotsContainer.appendChild(bookedSlotDiv);
      });
    });
}
