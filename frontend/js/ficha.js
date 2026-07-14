// Esperar a que todo el documento HTML esté cargado
document.addEventListener("DOMContentLoaded", () => {
    
    // 1. Inicializar los íconos de Lucide
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // 2. Animación de entrada en cascada (Staggered fade-in) para las tarjetas
    const bentoCards = document.querySelectorAll('.bento-card');
    
    bentoCards.forEach((card, index) => {
        // Establecer estado inicial (invisible y ligeramente desplazado hacia abajo)
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.6s ease-out, transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
        
        // Aplicar el retraso multiplicando el índice (crea el efecto cascada)
        setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, 100 * (index + 1));
    });

    // 3. (Opcional) Resaltado dinámico del menú lateral
    // Esto detecta en qué página estás y marca el botón del menú automáticamente
    const navLinks = document.querySelectorAll('aside nav a');
    const currentPath = window.location.pathname;

    navLinks.forEach(link => {
        const linkPath = link.getAttribute('href');
        
        // Comprobar si la ruta actual coincide con la del enlace
        if (currentPath.includes(linkPath) && linkPath !== '#') {
            // Estilos para el enlace activo
            link.className = "flex items-center gap-3 p-3 rounded-xl bg-slate-800 text-teal-400 border border-slate-700/50 text-sm font-bold shadow-inner";
        }
    });
});