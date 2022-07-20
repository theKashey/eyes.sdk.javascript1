export APPLITOOLS_BATCH_ID=$(shell python -c "import uuid;print(str(uuid.uuid4()))")

install_dev_requirements: install_test_requirements install_packages_editable
	python -m pip install --upgrade pre-commit


install_packages_editable: eyes_universal eyes_selenium eyes_robotframework
	set -e; for PACK in $^; do python -m pip install --upgrade --editable $$PACK; done


install_eyes_selenium: eyes_selenium/dist eyes_robotframework/dist install_eyes_universal
	python -m pip install eyes_selenium/dist/*


install_eyes_robotframework: eyes_selenium/dist eyes_robotframework/dist install_eyes_universal
	python -m pip install eyes_selenium/dist/* eyes_robotframework/dist/*


install_eyes_universal: eyes_universal/dist
	python -m pip install --no-index --find-links=file:eyes_universal/dist/ eyes_universal


install_test_requirements:
	python -m pip install --requirement requirements-test.txt


uninstall:
	python -m pip uninstall -y eyes-robotframework eyes-selenium eyes-universal


publish_eyes_selenium: eyes_selenium/dist install_publish_requirements
	bash ./ci_scripts/send_mail.sh python ${SDK_VERSION} eyes_selenium/CHANGELOG.md
	twine upload --verbose eyes_selenium/dist/*


publish_testing_eyes_selenium: eyes_selenium/dist install_publish_requirements
	echo bash ./ci_scripts/send_mail.sh python ${SDK_VERSION} eyes_selenium/CHANGELOG.md
	twine upload --verbose --repository testpypi eyes_selenium/dist/*


publish_eyes_robotframework: eyes_robotframework/dist install_publish_requirements
	bash ./ci_scripts/send_mail.sh eyes-robotframework ${SDK_VERSION} eyes_robotframework/CHANGELOG.md
	twine upload --verbose eyes_robotframework/dist/*


publish_testing_eyes_robotframework: eyes_robotframework/dist install_publish_requirements
	echo bash ./ci_scripts/send_mail.sh eyes-robotframework ${SDK_VERSION} eyes_robotframework/CHANGELOG.md
	twine upload --verbose --repository testpypi eyes_robotframework/dist/*


publish_eyes_universal: eyes_universal/dist install_publish_requirements
	twine upload --verbose eyes_universal/dist/*


publish_testing_eyes_universal: eyes_universal/dist install_publish_requirements
	twine upload --verbose --repository testpypi eyes_universal/dist/*


install_publish_requirements:
	python -m pip install twine


dist: eyes_universal/dist eyes_selenium/dist eyes_robotframework/dist


eyes_universal/dist:
	python -m pip install --upgrade wheel
	set -e; cd eyes_universal; \
	for PLAT in macosx_10_7_x86_64 macosx_11_0_arm64 manylinux1_x86_64 musllinux_1_2_x86_64 win_amd64; \
	do python setup.py bdist_wheel --plat-name=$$PLAT; rm -rf build; done


eyes_selenium/dist:
	python -m pip install --upgrade wheel
	cd eyes_selenium && python setup.py bdist_wheel


eyes_robotframework/dist:
	python -m pip install --upgrade wheel
	cd eyes_robotframework && python setup.py bdist_wheel


clean:
	for PACK in eyes_universal eyes_selenium eyes_robotframework; \
	do rm -rf $$PACK/dist $$PACK/build $$PACK/$$PACK.egg-info; done


gen_robot_docs:
	python -m robot.libdoc --format html EyesLibrary docs/eyes_robotframework/keywords.html


eyes_selenium_unit_tests: install_eyes_robotframework install_test_requirements
	pytest -n6 tests/unit


eyes_selenium_installation_tests: install_eyes_robotframework install_test_requirements
	pytest tests/test_installation.py


eyes_selenium_generated_tests: install_eyes_selenium install_test_requirements
	chmod a+x ./coverage-tests/python_tests.sh
	npm run python:tests  --prefix ./coverage-tests


eyes_robotframework_functional_tests: install_xvfb install_eyes_robotframework install_test_requirements
	xvfb-run --auto-servernum pytest -n6 tests/functional/eyes_robotframework/test_integration.py::test_suite_web


eyes_selenium_functional_tests: install_eyes_selenium install_test_requirements
	pytest -n6 -m "not sauce" tests/functional/eyes_selenium/


eyes_selenium_sauce_functional_tests: install_eyes_selenium install_test_requirements
	pytest -m sauce tests/functional/eyes_selenium/


install_xvfb:
	sudo apt-get install -y xvfb
