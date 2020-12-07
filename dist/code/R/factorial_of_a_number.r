num = as.integer(readline(prompt="Enter int: "))
factorial = 1
if(num < 0) {
print("Error: must be +")
} else if(num == 0) {
print("1")
} else {
for(i in 1:num) {
factorial = factorial * i
}
print(paste(factorial))
}