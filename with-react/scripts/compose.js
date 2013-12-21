/** @jsx React.DOM */
(function () {
  var CommentBox = React.createClass({
    render: function() {
      return (
       <div className="comment-box blah">
         Hello, world! I am a CommentBox.
       </div>
      );
    }
  });
  React.renderComponent(
    <CommentBox />,
    document.getElementById('content')
  );
})();
