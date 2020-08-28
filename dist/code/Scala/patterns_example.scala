package example

object patterns {
  
  abstract class Tree
  case class Branch(left: Tree, right: Tree) extends Tree
  case class Leaf(x: Int) extends Tree

  val tree1 = Branch(Branch(Leaf(1), Leaf(2)), Branch(Leaf(3), Leaf(4)))

  def sumLeaves(t: Tree): Int = t match {
    case Branch(l, r) => sumLeaves(l) + sumLeaves(r)
    case Leaf(x) => x
  }

  def find[A, B](it: Iterator[(A, B)], x: A): Option[B] = {
    var result: Option[B] = None
    while (it.hasNext && result == None) {
      val Pair(x1, y) = it.next
      if (x == x1) result = Some(y)
    }
    result
  }

  def printFinds[A](xs: List[(A, String)], x: A) =
    find(xs.elements, x) match {
      case Some(y) => println(y)
      case None => println("no match")
    }

  def main(args: Array[String]) {
    println("sum of leafs=" + sumLeaves(tree1))
    printFinds(List((3, "three"), (4, "four")), 4)
  }
}