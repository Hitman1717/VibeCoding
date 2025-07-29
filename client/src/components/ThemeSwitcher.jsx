import React, { useEffect, useState } from 'react';
import { NavDropdown } from 'react-bootstrap';

const themes = [
    { key: 'dark', name: 'Dark' },
    { key: 'sunset', name: 'Sunset' },
    { key: 'ocean-blue', name: 'Ocean Blue' },
    { key: 'sky-blue', name: 'Sky Blue' },
];

const ThemeSwitcher = () => {
  const [currentTheme, setCurrentTheme] = useState(localStorage.getItem("theme") || "dark");

  useEffect(() => {
    document.documentElement.setAttribute('data-bs-theme', currentTheme);
    localStorage.setItem('theme', currentTheme);
  }, [currentTheme]);

  return (
    <NavDropdown title="Theme" id="theme-switcher">
        {themes.map(theme => (
            <NavDropdown.Item key={theme.key} onClick={() => setCurrentTheme(theme.key)}>
                {theme.name}
            </NavDropdown.Item>
        ))}
    </NavDropdown>
  );
};

export default ThemeSwitcher;