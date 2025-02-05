export const saveBackground = (bgPath: string) => {
    localStorage.setItem('studyflow-background', bgPath);
  };
  
  export const getSavedBackground = () => {
    return localStorage.getItem('studyflow-background') || '/backgrounds/default-1.jpg';
  };