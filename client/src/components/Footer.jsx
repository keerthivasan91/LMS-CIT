import React from "react";
import "../App.css";

const Footer = () => {
  return (
    <footer className="app-footer">
      <p>
        © {new Date().getFullYear()} Cambridge Institute of Technology - All Rights Reserved.
      </p>
      <p className="footer-sub">
        Developed by Keerthi Vasan CSE-IOT Department
      </p>
    </footer>
  );
};

export default Footer;
