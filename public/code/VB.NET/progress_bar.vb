Public Class Form1
	Private Sub Button1_Click(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles Button1.Click

		Dim i As Integer

		ProgressBar1.Minimum = 0
		ProgressBar1.Maximum = 200

		For i = 0 To 200
			ProgressBar1.Value = i
		Next

	End Sub
End Class