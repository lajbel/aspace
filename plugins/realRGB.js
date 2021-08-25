function realRgbPlugin(k) {
    return {
        realRgb(r, g, b, a) {
            if (!a) a = 1;

            return k.rgba(r / 255, g / 255, b / 255, a);
        },
    };
}

export { realRgbPlugin }; 

// In https://lajbel.repl.co/plugins/realRGB.js