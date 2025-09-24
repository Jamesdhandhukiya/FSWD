// Show counter value when page loads
window.onload = () => {
  fetch('/counter')
    .then(res => res.json())
    .then(data => {
      document.getElementById('count').innerText = data.count;
    });
};

// Update counter
function updateCounter(action) {
  fetch('/counter', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: action })
  })
    .then(res => res.json())
    .then(data => {
      document.getElementById('count').innerText = data.count;
    });
}