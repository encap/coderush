impl Container<Article> for ArticlesResult {
  fn create_new_with_items(articles: Vec<Article>) -> ArticlesResult {
      ArticlesResult { articles: articles }
  }
}

pub fn get_tag_names<'a>(_a: &str) -> Option<TagsResult> {
      use models::Tag;
      use schema::tags;

      let conn = establish_connection();

      let tags_result =
          tags::table
          .load::<Tag>(&conn)
          .expect(
              "Error loading tags",
          );

      let result = tags_result.into_iter().map(|t| t.tag).collect();
      Some(TagsResult { tags: result,})
}