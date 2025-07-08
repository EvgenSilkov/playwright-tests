# Simple playwright-tests

### Simple playwright framework for e2e API and UI tests. Key features

- all UI selector complexity is in dedicated files
- support for mobile / desktop vieweports is done with `isMobile` fixture both in selectors and in tests
- structured apiClient with implicit checks for status codes, json() unwrapping, passing arbitrary data and moving errors on test level
- tracking system requirements that mapping them to the lines of code where they are validated
- short github-actions for CI + slack integrations 
- simple Dockerfile for gitlab CI / jenkins

#### Limitations

No action returns state for later usage. It is not a typical PageObject model. It doesn't provide you any info where you'll end up after a click. With "Locality of behaviour" principle in mind it is amazing. Attempt to build frameworkus-gigantus-aparatus will fail miserably (but at least it'll be fast).