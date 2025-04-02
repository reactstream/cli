// This file contains additional functionality for interactive components

// Feature card hover effects
function initializeFeatureCards() {
    const featureCards = document.querySelectorAll('.feature-card');

    featureCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.classList.add('transform', 'scale-105');
        });

        card.addEventListener('mouseleave', () => {
            card.classList.remove('transform', 'scale-105');
        });
    });
}

// FAQ accordion functionality
function initializeFaqAccordion() {
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');

        question.addEventListener('click', () => {
            // Close all other answers
            document.querySelectorAll('.faq-answer').forEach(el => {
                if (el !== answer) {
                    el.classList.add('hidden');
                }
            });

            // Toggle current answer
            answer.classList.toggle('hidden');

            // Update icon
            const icon = question.querySelector('i');
            if (answer.classList.contains('hidden')) {
                icon.classList.remove('fa-chevron-up');
                icon.classList.add('fa-chevron-down');
            } else {
                icon.classList.remove('fa-chevron-down');
                icon.classList.add('fa-chevron-up');
            }
        });
    });
}

// Initialize components after they're loaded
document.addEventListener('DOMContentLoaded', function() {
    // Set a timeout to ensure components are loaded
    setTimeout(() => {
        initializeFeatureCards();
        initializeFaqAccordion();
    }, 500);
});
