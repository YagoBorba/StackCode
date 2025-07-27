const recommendedBump = require('conventional-recommended-bump');

(async () => {
    try {
        const recommendation = await new Promise((resolve, reject) => {
            recommendedBump({ preset: 'angular' }, (error, recommendation) => {
                if (error) {
                    return reject(error);
                }
                resolve(recommendation);
            });
        });
        console.log(JSON.stringify(recommendation));
    } catch (error) {
        console.error('Um erro ocorreu no release-worker:', error);
        process.exit(1);
    }
})();