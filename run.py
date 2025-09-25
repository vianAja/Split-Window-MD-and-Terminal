import os

os.system('git add .')
message = input("Commit Message\n   => ")

os.system(f'git commit -m "{message}"')
os.system('git push')