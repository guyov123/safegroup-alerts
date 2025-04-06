
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
      const defaultToken = 'pk.eyJ1IjoibG92YWJsZS1kZW1vIiwiYSI6ImNsdDFiczdyZDFuZ3cycXFudzB3cmQ0MHMifQ.YlWXIhJYj8cFGl6Jv2nG0Q';
      localStorage.setItem('mapbox_token', defaultToken);
      setMapboxToken(defaultToken);
    }
  }, []);
  
  return mapboxToken;
}
