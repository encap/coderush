Public Function NewTimerProc(ByVal hwnd As Long, ByVal Msg As Long, ByVal wparam As Long, _
        ByVal lparam As Long) As Long
    KillTimer hwnd, wparam
    Select Case wparam
         Case NV_CLOSEMSGBOX
             mHandle = FindWindow("#32770", mTitle)
             If mHandle <> 0 Then
                  SetForegroundWindow mHandle
                  SendKeys "{enter}"
             End If
             
        Case NV_MOVEMSGBOX
             mHandle = FindWindow("#32770", mTitle)
             If mHandle <> 0 Then
                  Dim w As Single, h As Single
                  Dim mBox As RECT
                  w = Screen.Width / Screen.TwipsPerPixelX
                  h = Screen.Height / Screen.TwipsPerPixelY
                  GetWindowRect mHandle, mBox
                  If mX > (w - (mBox.Right - mBox.Left) - 1) Then mX = (w - (mBox.Right - mBox.Left) - 1)
                  If mY > (h - (mBox.Bottom - mBox.Top) - 1) Then mY = (h - (mBox.Bottom - mBox.Top) - 1)
                  If mX < 1 Then mX = 1: If mY < 1 Then mY = 1
                  SetWindowPos mHandle, HWND_TOPMOST, mX, mY, 0, 0, SWP_NOSIZE
             End If
    End Select
End Function