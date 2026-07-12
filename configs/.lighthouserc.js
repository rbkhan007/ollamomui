module.exports = {
  ci: {
    collect: {
      numberOfRuns: 1,
      headless: true,
      url: [
        "https://ollamomui.vercel.app/",
        "https://ollamomui.vercel.app/pricing",
        "https://ollamomui.vercel.app/download",
        "https://ollamomui.vercel.app/playground",
        "https://ollamomui.vercel.app/rag",
        "https://ollamomui.vercel.app/memory",
        "https://ollamomui.vercel.app/about",
      ],
    },
    assert: {
      assertions: {
        "categories:seo": ["warn", { minScore: 0.9 }],
        "categories:accessibility": ["warn", { minScore: 0.9 }],
        "categories:best-practices": ["warn", { minScore: 0.9 }],
        "categories:performance": ["warn", { minScore: 0.7 }],
      },
    },
    upload: {
      target: "temporary",
    },
  },
};
