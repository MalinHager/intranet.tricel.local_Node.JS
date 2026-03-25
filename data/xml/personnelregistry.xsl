<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
<xsl:template match="/">

<html>
<body>

<table border="0" cellspacing="0" cellpadding="0">
 <tr>
  <td colspan="11" height="1" bgcolor="#000000"></td>
 </tr>
 <tr>
  <td width="1" bgcolor="#000000"></td>
  <td height="30" width="130" valign="middle" align="center" bgcolor="#b0dfdf"><font size="2" face="arial" color="#ffffff"><b>EMPLOYEE CODE</b></font></td>
  <td width="1" bgcolor="#000000"></td>
  <td height="30" width="130" valign="middle" align="center" bgcolor="#548d8d"><font size="2" face="arial" color="#ffffff"><b>NAME</b></font></td>
  <td width="1" bgcolor="#000000"></td>
  <td height="30" width="130" valign="middle" align="center" bgcolor="#b0dfdf"><font size="2" face="arial" color="#ffffff"><b>SIGNATURE DATE</b></font></td>
  <td width="1" bgcolor="#000000"></td>
  <td height="30" width="130" valign="middle" align="center" bgcolor="#b0dfdf"><font size="2" face="arial" color="#ffffff"><b>RANK</b></font></td>
  <td width="1" bgcolor="#000000"></td>
  <td height="30" width="130" valign="middle" align="center" bgcolor="#b0dfdf"><font size="2" face="arial" color="#ffffff"><b>ACCESS LEVEL</b></font></td>
  <td width="1" bgcolor="#000000"></td>
 </tr>

 <tr>
  <td colspan="11" height="1" bgcolor="#000000"></td>
 </tr>

	<xsl:for-each select="personnelRegistry/employee">
	 <tr>
	  <td width="1" bgcolor="#000000"></td>
	  <td height="30" width="130" valign="middle" align="center"><font size="2" face="arial"><b><xsl:value-of select="employeeCode" /></b></font></td>
	  <td width="1" bgcolor="#000000"></td>
	  <td height="30" width="130" valign="middle" align="center"><font size="2" face="arial"><b><xsl:value-of select="name" /></b></font></td>
	  <td width="1" bgcolor="#000000"></td>
	  <td height="30" width="130" valign="middle" align="center"><font size="2" face="arial"><b><xsl:value-of select="signatureDate" /></b></font></td>
	  <td width="1" bgcolor="#000000"></td>
	  <td height="30" width="130" valign="middle" align="center"><font size="2" face="arial"><b><xsl:value-of select="rank" /></b></font></td>
	  <td width="1" bgcolor="#000000"></td>
	  <td height="30" width="130" valign="middle" align="center"><font size="2" face="arial"><b><xsl:value-of select="securityAccessLevel" /></b></font></td>
	  <td width="1" bgcolor="#000000"></td>
	 </tr>
	 <tr>
 	  <td colspan="11" height="1" bgcolor="#000000"></td>
	 </tr>

	</xsl:for-each>
</table>

</body>
</html>

</xsl:template>
</xsl:stylesheet>