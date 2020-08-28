#include <stdio.h>

int main() {
    int n, reversedN = 0, remainder, originalN;
    printf("Enter int: ");
    scanf("%d", &n);
    originalN = n;

    while (n != 0) {
        remainder = n % 10;
        reversedN = reversedN * 10 + remainder;
        n /= 10;
    }

    if (originalN == reversedN)
        printf("%d palindrome.", originalN);
    else
        printf("%d not palindrome.", originalN);

    return 0;
}