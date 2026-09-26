Automated UI tests for the Inventory → Tags module of the Artisans POS admin portal, written in Playwright with TypeScript using the Page Object Model.

Note: This repository is shared for code review of the automation flow. The tests run against shared environment that requires private credentials, and some tests are known to be flaky because of environment behaviour.

Test coverage
Test	What it verifies
User can create tag	A new tag is saved and appears in the tag list
User can edit tag	A newly created tag can be renamed, and only the new name remains in the list
User can delete tag	A newly created tag can be deleted after confirming the warning modal, and it is removed from the list
Duplicate tag name is not accepted	Submitting an existing tag name shows the "name has already been taken" validation error
