module.exports = {
  ci: {
    collect: {
      numberOfRuns: 1,
      headless: true,
      url: [
        "https://rbkhan007.github.io/Ollama-Emulator-Desktop-Ultimate/",
        "https://rbkhan007.github.io/Ollama-Emulator-Desktop-Ultimate/about",
        "https://rbkhan007.github.io/Ollama-Emulator-Desktop-Ultimate/playground",
        "https://rbkhan007.github.io/Ollama-Emulator-Desktop-Ultimate/knowledge",
        "https://rbkhan007.github.io/Ollama-Emulator-Desktop-Ultimate/memory",
        "https://rbkhan007.github.io/Ollama-Emulator-Desktop-Ultimate/usage",
        "https://rbkhan007.github.io/Ollama-Emulator-Desktop-Ultimate/settings",
        "https://rbkhan007.github.io/Ollama-Emulator-Desktop-Ultimate/login",
        "https://rbkhan007.github.io/Ollama-Emulator-Desktop-Ultimate/register",
        "https://rbkhan007.github.io/Ollama-Emulator-Desktop-Ultimate/setup",
      ],
    },
    assert: {
      assertions: {
        "categories:seo": ["warn", { minScore: 1 }],
        "categories:accessibility": ["warn", { minScore: 1 }],
        "categories:best-practices": ["warn", { minScore: 1 }],
        "categories:performance": ["warn", { minScore: 1 }],
      },
    },
    upload: {
      target: "temporary",
    },
  },
};
