#docx-splitter
##What it does
Takes a .docx file, converts it to HTML, then splits it into logical sections based on the content styling.  As of right now, the sections are put into `<textarea>` blocks that are editable using jHtmlArea.
##Why?
Sometimes you have a nicely formatted Word document with content sections that you want to import for use online.  There's no easy way to split up the document content based on the sections so you can use them independently.  For example, if you have a list of steps in a document and want to programmatically take actions for each step, there's no easy way to do it.  This project aims to parse out a Document into logical sections based on its content.
##How it works
This project is heavily based on [Mammoth](https://github.com/mwilliamson/mammoth.js), a robust javascript library that converts .docx to nicely formatted HTML.  It also makes use of [jHtmlArea](https://jhtmlarea.codeplex.com/) for making content editable, but you could use any editor really (or none at all if you want to use the sections themselves).

1. First, documents are imported and converted to an HTML string using Mammoth.
2. Next, the string is split into an array with each element containing the equivalent of a line in the original Word doc (uses regex to do the splitting)
3. A second array then grabs the HTML tags preceding the actual content of each line.  For example, if a line is `<p><strong><em>Stuff</em></strong></p>` it will grab `<p><strong><em>`
4. A parsing loop then iterates across the second array and looks for the hgihest-level matching tags from all the lines that don't occur right next to each other.  For example, if the structure is
  
    ```
    <h1>Stuff</h1>
    <h2>Stuff2</h2>
    <h3>Stuff3</h3>
    <p>I'm a paragraph</p>
    <h3>Stuff 4</h3>
    <p>I'm another paragraph</p>
    ```

    It will find the `<h3>` tags as the highest matches.
5. Another loop then runs to split the HTML lines into sections based on where the matches occur.
6. For demonstration purposes, right now the content sections are then added into <textarea> blocks that are made editable via jHtmlArea.

##Instructions
Clone/download/whatever all files and run split.html in a browser.  Use the button to upload a .docx file of your choice and that's it.

##Caveats
I banged this out in a few hours of trial and error without much thought to code elegance.  As a result, it's currently somewhat of a mess and is definitely not efficient.  It's also important to note that Mammoth purposely forces Word .docx content into well-formatted HTML, so it discards formatting including colors, font sizes, and font typefaces.  If you need to retain this styling information, you'll need to find another library.
