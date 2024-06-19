const Footer = ({children}) => {
    return ( 
    <footer className="footer">
        Tous droits réservés &copy; Yanis et Florian {new Date().getFullYear()}    
    </footer>
    )
}

export default Footer;