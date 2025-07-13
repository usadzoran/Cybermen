const socket = io();
const params = new URLSearchParams(location.search);
const name = params.get('name'), avatar = params.get('avatar'), gender = params.get('gender');

document.getElementById('hdr').innerText = gender === 'men' ? `غرفة الرجال - ${name}` : `غرفة النساء - ${name}`;

socket.emit('join', { username: name, avatar, gender });

const audio = new Audio('https://www.myinstants.com/media/sounds/bleep.mp3');

socket.on('userList', users => {
  document.getElementById('userList').innerHTML = users.map(u=>`<div>${u.avatar} ${u.username} <button onclick="startCall('${u.username}')">📹</button></div>`).join('');
});

socket.on('message', data => {
  let m = document.getElementById('messages');
  m.innerHTML += `<div><strong>${data.avatar} ${data.username}:</strong> ${data.text}</div>`;
  m.scrollTop = m.scrollHeight;
  audio.play();
});

socket.on('badword', () => alert('يرجى تجنب الكلمات المسيئة 🔞'));

function sendMsg() {
  const txt = document.getElementById('msgInput').value.trim();
  if (!txt) return;
  socket.emit('message', txt);
  document.getElementById('msgInput').value = '';
}

function startCall(userCallee) {
  const roomName = `${gender}-${name}-call-${userCallee}`;
  const win = window.open('', '_blank');
  const domain = "meet.jit.si";
  const options = { roomName, parentNode: undefined };
  const api = new JitsiMeetExternalAPI(domain, options);
  api.executeCommand('displayName', name);
}
