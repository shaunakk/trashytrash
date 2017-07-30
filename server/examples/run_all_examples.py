
from __future__ import print_function
import os
import subprocess
import time

examples_that_must_be_stopped_externally = [
    'simple_subscribe.py',
    'multiple_filter_subscribe.py',
    'filter_subscription.py',
    'history_count_subscription.py',
    'history_age_subscription.py']


def main():
    for file in os.listdir('examples'):
        if file.endswith('.py') and\
                file not in [os.path.basename(__file__), '__init__.py']:
            run_example(
                os.path.join('examples', file),
                file in examples_that_must_be_stopped_externally)


def run_example(file, must_kill):
    p = subprocess.Popen(['python', file])

    if must_kill:
        time.sleep(10)
        assert p.returncode is None
        p.terminate()

    p.communicate()

    if not must_kill:
        assert p.returncode is 0

    print(file, must_kill)


if __name__ == '__main__':
    main()
