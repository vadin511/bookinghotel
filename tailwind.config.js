import plugin from 'tailwindcss/plugin';

export const plugins = [
    plugin(function ({ addBase }) {
        addBase({
            'h1, h2, h3, h4, h5, h6': {
                fontSize: 'revert',
                fontWeight: 'revert',
                margin: 'revert',
            },
        });
    }),
];