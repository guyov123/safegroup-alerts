
import { useState, useEffect } from 'react';

export function useMapboxToken(): string {
  // בעולם אמיתי, רצוי לשמור את המפתח בסביבת השרת או בסופאבייס
  // אך לצורך הדגמה, אנחנו משתמשים במפתח ציבורי זמני
  const [mapboxToken, setMapboxToken] = useState<string>('');
  
  useEffect(() => {
    // ניסיון למצוא טוקן בלוקל סטורג'
    const storedToken = localStorage.getItem('mapbox_token');
    
    if (storedToken) {
      setMapboxToken(storedToken);
    } else {
      // במקרה אמיתי, כאן היינו עושים קריאה לסופאבייס או שרת בשביל לקבל את הטוקן
      // לצורך הדגמה, אנחנו משתמשים בערך ברירת מחדל
      const defaultToken = 'pk.eyJ1IjoibXJzaGFwcm9uIiwiYSI6ImNtOTVpdWY3bjE0aGUycHF6cGpraDhvdGMifQ.Zcl9RxqHJ9zVFDTS6SmcpA';
      localStorage.setItem('mapbox_token', defaultToken);
      setMapboxToken(defaultToken);
    }
  }, []);
  
  return mapboxToken;
}
