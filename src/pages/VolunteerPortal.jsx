const handleAttendance = (action) => {
  if (!volunteerId.trim()) return setStatus({ type: 'error', message: 'Please enter your Volunteer ID!' });
  
  setLoading(true);
  setStatus({ type: '', message: 'Checking location...' });

  // 1. የGPS ትክክለኛነት ለመጨመር options
  const options = { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 };

  navigator.geolocation.getCurrentPosition(
    (position) => {
      // 2. ወደ Backend መላኪያ
      fetch("https://er-attendance-backend.onrender.com/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          volunteer_id: volunteerId.trim(), 
          user_lat: position.coords.latitude, 
          user_lon: position.coords.longitude, 
          action 
        })
      })
      .then(async (res) => {
        const data = await res.json();
        
        // 3. የBackend ምላሽ (status) መፈተሽ
        if (data.status === 'success') {
          setStatus({ type: 'success', message: `${action.toUpperCase()} successful!` });
          setVolunteerId(''); // ስኬታማ ከሆነ ID-ውን ያጸዳዋል
        } else {
          // Backend የሚልክልን error መልእክት (ለምሳሌ ርቀት፣ anti-cheat)
          setStatus({ type: 'error', message: data.message });
        }
      })
      .catch(() => setStatus({ type: 'error', message: 'Server connection failed!' }))
      .finally(() => setLoading(false));
    },
    (error) => {
      setLoading(false);
      setStatus({ type: 'error', message: 'Location access is required!' });
    },
    options
  );
};