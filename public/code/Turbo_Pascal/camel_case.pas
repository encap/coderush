program Camelcase;

var
    text, cc: string;
    c: char;
    i: integer;
    lastSpace: boolean;

begin
    readln(text);
    lastSpace := true;
    cc := '';
    for i := 1 to Length(text) do
    begin
        c := text[i];
        if ((c >= #65) and (c <= #90)) or ((c >= #97) and (c <= #122)) then
        begin
            if (lastSpace) then
            begin
                if ((c >= #97) and (c <= #122)) then
                    c := chr(ord(c) - 32);
            end
            else
                if ((c >= #65) and (c <= #90)) then
                    c := chr(ord(c) + 32);
            cc := cc + c;
            lastSpace := false;
        end
        else
            lastSpace := true;
    end;
    writeln(cc);
end. 