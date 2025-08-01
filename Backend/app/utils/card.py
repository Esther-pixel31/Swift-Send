import random

def generate_card_number():
    """
    Generates a 16-digit pseudo-random card number starting with '55'.
    """
    prefix = "55"  # MasterCard range (as an example)
    remaining_digits = ''.join(str(random.randint(0, 9)) for _ in range(14))
    return prefix + remaining_digits
