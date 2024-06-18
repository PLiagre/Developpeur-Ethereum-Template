const Footer = ({children}) => {
    return ( 
    <footer className="footer">
        Tous droits reservés &copy; Yanis et Florian {new Date().getFullYear()}    
    </footer>
    )
}

export default Footer;