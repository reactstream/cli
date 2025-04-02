document.addEventListener('DOMContentLoaded', function() {
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // Load all component HTML fragments
    loadComponent('features', 'components/features.html');
    loadComponent('how-it-works', 'components/how-it-works.html');
    loadComponent('documentation', 'components/documentation.html');
    loadComponent('examples', 'components/examples.html');
    loadComponent('download', 'components/download.html');
    loadComponent('testimonials', 'components/testimonials.html');
    loadComponent('faq', 'components/faq.html');
    loadComponent('footer', 'components/footer.html');
});

// Function to load HTML fragments into containers
function loadComponent(id, url) {
    fetch(url)
        .then(response => response.text())
        .then(html => {
            document.getElementById(`${id}-container`).innerHTML = html;
        })
        .catch(error => {
            console.error(`Error loading component ${id}:`, error);
        });
}
