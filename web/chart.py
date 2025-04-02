import numpy as np
import matplotlib.pyplot as plt

# Zakres wieków
AGE = np.arange(1, 101)

# Funkcja
f_AGE = 1 / (1 + (AGE - 18) % 10)

# Tworzenie wykresu
plt.plot(AGE, f_AGE, marker="o", linestyle="-", color="b", label=r'$f(\text{AGE}) = \frac{1}{1 + \mod(\text{AGE} - 18, 10)}$')

# Opisy osi
plt.xlabel("AGE")
plt.ylabel("f(AGE)")
plt.title("Wykres funkcji f(AGE)")

# Dodanie siatki i legendy
plt.grid(True)
plt.legend()
plt.show()
