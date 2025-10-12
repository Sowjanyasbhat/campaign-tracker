const API = 'http://localhost:5000/api';
let token = null;
async function api(path, opts={}) {
  const headers = opts.headers || {};
  if(token) headers['Authorization'] = 'Bearer ' + token;
  const res = await fetch(API + path, {...opts, headers: {...headers, 'Content-Type':'application/json'}});
  if(res.status === 204) return null;
  return res.json();
}
document.getElementById('login-btn').addEventListener('click', async ()=> {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  if(username === 'admin' && password === 'password123'){
    token = 'dummy-token';
    document.getElementById('user-label').textContent = `Welcome, ${username}!`;
    document.getElementById('login-area').style.display = 'none';
    document.querySelector('.dashboard').style.display = 'grid';
    document.querySelector('#campaign-form').style.display = 'block';
    loadCampaigns();
  } else {
    alert('Invalid username or password!');
  }
});
document.getElementById('campaign-form').addEventListener('submit', async (e)=> {
  e.preventDefault();
  const campaign_name = document.getElementById('campaign_name').value;
  const client_name = document.getElementById('client_name').value;
  const start_date = document.getElementById('start_date').value;
  const status = document.getElementById('status').value;
  try{
    await api('/campaigns', {method:'POST', body: JSON.stringify({campaign_name, client_name, start_date, status})});
    e.target.reset();
    loadCampaigns();
  } catch(err){ alert('Add error'); }
});
async function loadCampaigns() {
  const q = document.getElementById('search').value;
  const status = document.getElementById('filter-status').value;
  const params = new URLSearchParams();
  if(q) params.append('q', q);
  if(status) params.append('status', status);
  const list = await api('/campaigns?' + params.toString());
  renderTable(list);
  renderDashboard(list);
}
function renderTable(list){
  const tbody = document.querySelector('#campaign-table tbody');
  tbody.innerHTML = '';
  list.forEach(c=>{
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${c.campaign_name}</td>
      <td>${c.client_name}</td>
      <td>${c.start_date}</td>
      <td>
        <select data-id="${c._id}" class="status-select">
          <option ${c.status==='Active'?'selected':''}>Active</option>
          <option ${c.status==='Paused'?'selected':''}>Paused</option>
          <option ${c.status==='Completed'?'selected':''}>Completed</option>
        </select>
      </td>
      <td class="actions">
        <button data-id="${c._id}" class="delete-btn">Delete</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  document.querySelectorAll('.status-select').forEach(s=>{
    s.addEventListener('change', async (e)=>{
      const id = e.target.getAttribute('data-id');
      const status = e.target.value;
      await api('/campaigns/' + id, {method:'PUT', body: JSON.stringify({status})});
      loadCampaigns();
    });
  });

  document.querySelectorAll('.delete-btn').forEach(b=>{
    b.addEventListener('click', async (e)=>{
      const id = e.target.getAttribute('data-id');
      if(confirm('Delete this campaign?')){
        await api('/campaigns/' + id, {method:'DELETE'});
        loadCampaigns();
      }
    });
  });
}
function renderDashboard(list){
  const total = list.length;
  const active = list.filter(c=>c.status==='Active').length;
  const paused = list.filter(c=>c.status==='Paused').length;
  const completed = list.filter(c=>c.status==='Completed').length;
  document.getElementById('total-count').textContent = total;
  document.getElementById('active-count').textContent = active;
  document.getElementById('paused-count').textContent = paused;
  document.getElementById('completed-count').textContent = completed;
}
document.getElementById('refresh').addEventListener('click', (e)=>{ e.preventDefault(); loadCampaigns(); });
document.getElementById('search').addEventListener('input', ()=>{ loadCampaigns(); });
document.getElementById('filter-status').addEventListener('change', ()=>{ loadCampaigns(); });
document.querySelector('.dashboard').style.display = 'none';
document.querySelector('#campaign-form').style.display = 'none';
