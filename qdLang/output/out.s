
.text
.global  _start

stdout = 1

_start:

mov %rsp, %rbp
push $2
push $5
mov $2, %r8


mov    $greet_len,%rdx
mov    $greet,%rsi
mov    $stdout,%rdi
mov    $1,%rax
syscall
    

mov    $loopy_len,%rdx
mov    $loopy,%rsi
mov    $stdout,%rdi
mov    $1,%rax
syscall
    
mov    $loopy_len,%rdx
mov    $loopy,%rsi
mov    $stdout,%rdi
mov    $1,%rax
syscall
    
mov    $loopy_len,%rdx
mov    $loopy,%rsi
mov    $stdout,%rdi
mov    $1,%rax
syscall
    
mov    $loopy_len,%rdx
mov    $loopy,%rsi
mov    $stdout,%rdi
mov    $1,%rax
syscall
    
mov    $loopy_len,%rdx
mov    $loopy,%rsi
mov    $stdout,%rdi
mov    $1,%rax
syscall
    

mov    $varAis_len,%rdx
mov    $varAis,%rsi
mov    $stdout,%rdi
mov    $1,%rax
syscall
    

push   -8(%rbp)
add    $48, (%rsp)
mov    $1,%rdx
mov    %rsp,%rsi
mov    $stdout,%rdi
mov    $1,%rax
syscall
    

mov    $lnbr_len,%rdx
mov    $lnbr,%rsi
mov    $stdout,%rdi
mov    $1,%rax
syscall
    

mov    $varBis_len,%rdx
mov    $varBis,%rsi
mov    $stdout,%rdi
mov    $1,%rax
syscall
    

push   -16(%rbp)
add    $48, (%rsp)
mov    $1,%rdx
mov    %rsp,%rsi
mov    $stdout,%rdi
mov    $1,%rax
syscall
    

mov    $lnbr_len,%rdx
mov    $lnbr,%rsi
mov    $stdout,%rdi
mov    $1,%rax
syscall
    

mov -8(%rbp), %rax
mov $4, %rbx
add %rax, %rbx
mov %rbx, -16(%rbp)


mov -16(%rbp), %rax
mov $2, %rbx
sub %rbx, %rax
mov %rax, -8(%rbp)


mov    $varAis_len,%rdx
mov    $varAis,%rsi
mov    $stdout,%rdi
mov    $1,%rax
syscall
    

push   -8(%rbp)
add    $48, (%rsp)
mov    $1,%rdx
mov    %rsp,%rsi
mov    $stdout,%rdi
mov    $1,%rax
syscall
    

mov    $lnbr_len,%rdx
mov    $lnbr,%rsi
mov    $stdout,%rdi
mov    $1,%rax
syscall
    

mov    $varBis_len,%rdx
mov    $varBis,%rsi
mov    $stdout,%rdi
mov    $1,%rax
syscall
    

push   -16(%rbp)
add    $48, (%rsp)
mov    $1,%rdx
mov    %rsp,%rsi
mov    $stdout,%rdi
mov    $1,%rax
syscall
    

mov    $lnbr_len,%rdx
mov    $lnbr,%rsi
mov    $stdout,%rdi
mov    $1,%rax
syscall
    

mov    $bye_len,%rdx
mov    $bye,%rsi
mov    $stdout,%rdi
mov    $1,%rax
syscall
    

mov    $0,%rdi
mov    $60,%rax
syscall

.data

greet: .ascii "Hello there!\n"
.set greet_len , 13

loopy: .ascii "Loop!!\n"
.set loopy_len , 7

bye: .ascii "Goodbye!\n"
.set bye_len , 9

varAis: .ascii "Variable A is: "
.set varAis_len , 15

varBis: .ascii "Variable B is: "
.set varBis_len , 15

lnbr: .ascii "\n"
.set lnbr_len , 1

