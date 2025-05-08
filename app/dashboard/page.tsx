'use client';
const handleLogout = async () => {
        
  const res = await fetch('/api/logout', {
    method: 'POST',
  });
  const data = await res.json();
  alert(data.message)
  window.location.href = '/login'
};
export default function DashboardPage() {
    return (<div>
      <button onClick={handleLogout}>Logout</button>
    </div>)
  }
