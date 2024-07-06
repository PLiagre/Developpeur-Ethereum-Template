const Footer = ({children}) => {
    return ( 
    <footer className="footer text-2xl font-bold text-gray-800 dark:text-white">
        Tous droits réservés &copy; Yanis et Florian {new Date().getFullYear()}    
    </footer>
    )
}

export default Footer;