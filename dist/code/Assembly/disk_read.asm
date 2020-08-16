disk_read:
        pusha
        push dx

        mov ah, 0x02
        mov al, dh
        mov ch, 0x00
        mov dh, 0x00
        mov cl, 0x02
        int 0x13

        jc disk_read_error

        pop dx
        cmp dh, al
        jne disk_read_error

        popa
        ret

disk_read_error:
        mov bx, DISK_READ_ERROR_MSG
        call print_string
        hlt